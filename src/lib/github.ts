import { DEPENDENCY_FILES, type CodeSearchResult, type DependencyScanResult, type RepositoryContext, type SearchHit } from './types';

const GITHUB_API = 'https://api.github.com';
const CODE_SEARCH_ACCEPT = 'application/vnd.github.text-match+json';
const DEFAULT_ACCEPT = 'application/vnd.github.v3+json';
const ROOT_DEPENDENCY_FILES = new Set(DEPENDENCY_FILES.map((file) => file.toLowerCase()));

type GitHubErrorKind = 'NOT_FOUND' | 'ACCESS_DENIED' | 'RATE_LIMITED' | 'NETWORK';

type GitHubResponse<T> = {
  ok: boolean;
  status: number;
  headers: Headers;
  data: T | null;
};

type TreeResponse = {
  tree?: Array<{ path: string; type: 'blob' | 'tree'; sha: string }>;
  truncated?: boolean;
};

type BlobResponse = {
  content?: string;
  encoding?: string;
};

class GitHubApiError extends Error {
  kind: GitHubErrorKind;

  constructor(kind: GitHubErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

function headers(token?: string, accept = DEFAULT_ACCEPT): Record<string, string> {
  const h: Record<string, string> = { Accept: accept };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url.trim();
  const shorthandMatch = cleaned.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/);
  if (shorthandMatch) {
    return { owner: shorthandMatch[1], repo: shorthandMatch[2] };
  }

  const normalized = /^(https?:)?\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;

  try {
    const parsed = new URL(normalized);
    if (!['github.com', 'www.github.com'].includes(parsed.hostname)) {
      return null;
    }

    const [, owner, repo] = parsed.pathname.replace(/\/+$/, '').match(/^\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/) ?? [];
    if (owner && repo) {
      return { owner, repo };
    }
  } catch {
    return null;
  }

  return null;
}

async function requestGitHubJson<T>(url: string, token?: string, accept = DEFAULT_ACCEPT): Promise<GitHubResponse<T>> {
  try {
    const res = await fetch(url, { headers: headers(token, accept) });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, headers: res.headers, data };
  } catch {
    throw new GitHubApiError('NETWORK', 'Unable to reach GitHub. Check your network connection and try again.');
  }
}

function buildRepoError(status: number, headersMap: Headers, repoFullName: string): GitHubApiError {
  if (status === 404) {
    return new GitHubApiError('NOT_FOUND', `Repository ${repoFullName} was not found or is not accessible.`);
  }

  if (status === 401 || status === 403) {
    if (headersMap.get('x-ratelimit-remaining') === '0') {
      return new GitHubApiError('RATE_LIMITED', 'GitHub API rate limit exceeded. Add a GitHub token for higher limits.');
    }

    return new GitHubApiError('ACCESS_DENIED', `GitHub denied access to ${repoFullName}. If it is private, add a token with repo access.`);
  }

  return new GitHubApiError('NETWORK', `GitHub returned an unexpected ${status} response while checking ${repoFullName}.`);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker())
  );

  return results;
}

export function looksLikeDependencyFilePath(path: string): boolean {
  const lower = path.toLowerCase();
  const name = lower.split('/').pop() ?? lower;

  if (ROOT_DEPENDENCY_FILES.has(name)) {
    return true;
  }

  if (/^(requirements|constraints)(?:[-._][a-z0-9]+)?\.txt$/i.test(name)) {
    return true;
  }

  return /(^|\/)(requirements|constraints)\/.+\.txt$/i.test(lower);
}

export async function fetchRepositoryContext(owner: string, repo: string, token?: string): Promise<RepositoryContext> {
  const response = await requestGitHubJson<{ full_name?: string; default_branch?: string }>(
    `${GITHUB_API}/repos/${owner}/${repo}`,
    token
  );

  if (!response.ok) {
    throw buildRepoError(response.status, response.headers, `${owner}/${repo}`);
  }

  return {
    owner,
    repo,
    repoFullName: response.data?.full_name ?? `${owner}/${repo}`,
    defaultBranch: response.data?.default_branch ?? 'main',
  };
}

async function fetchDependencyTree(context: RepositoryContext, token?: string): Promise<TreeResponse> {
  const response = await requestGitHubJson<TreeResponse>(
    `${GITHUB_API}/repos/${context.owner}/${context.repo}/git/trees/${encodeURIComponent(context.defaultBranch)}?recursive=1`,
    token
  );

  if (!response.ok) {
    if (response.status === 409) {
      return {};
    }

    throw buildRepoError(response.status, response.headers, context.repoFullName);
  }

  return response.data ?? {};
}

async function fetchBlobContent(owner: string, repo: string, sha: string, token?: string): Promise<string | null> {
  const response = await requestGitHubJson<BlobResponse>(
    `${GITHUB_API}/repos/${owner}/${repo}/git/blobs/${sha}`,
    token
  );

  if (!response.ok) {
    return null;
  }

  if (response.data?.content && response.data.encoding === 'base64') {
    return atob(response.data.content.replace(/\n/g, ''));
  }

  return null;
}

export async function fetchAllDependencyFiles(context: RepositoryContext, token?: string): Promise<DependencyScanResult> {
  const tree = await fetchDependencyTree(context, token);
  const matchingFiles = (tree.tree ?? [])
    .filter((entry) => entry.type === 'blob' && looksLikeDependencyFilePath(entry.path));

  const fetchedFiles = await mapWithConcurrency(matchingFiles, 6, async (entry) => {
    const content = await fetchBlobContent(context.owner, context.repo, entry.sha, token);
    if (!content) {
      return null;
    }

    return { path: entry.path, content };
  });

  return {
    files: fetchedFiles.filter((file): file is NonNullable<typeof file> => file !== null),
    incomplete: Boolean(tree.truncated) || fetchedFiles.some((file) => file === null),
  };
}

export async function searchCodeForLitellm(context: RepositoryContext, token?: string): Promise<CodeSearchResult> {
  const query = encodeURIComponent(`litellm repo:${context.repoFullName}`);
  const response = await requestGitHubJson<{ items?: Array<{ path: string; text_matches?: { fragment: string }[] }> }>(
    `${GITHUB_API}/search/code?q=${query}&per_page=20`,
    token,
    CODE_SEARCH_ACCEPT
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403 || response.status === 422) {
      return { hits: [], incomplete: true };
    }

    throw buildRepoError(response.status, response.headers, context.repoFullName);
  }

  const hits: SearchHit[] = (response.data?.items ?? []).map((item) => ({
    filePath: item.path,
    matchFragment: item.text_matches?.[0]?.fragment || '',
  }));

  return { hits, incomplete: false };
}
