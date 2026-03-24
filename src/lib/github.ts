import { DEPENDENCY_FILES } from './types';

const GITHUB_API = 'https://api.github.com';

function headers(token?: string): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url.trim().replace(/\/+$/, '');
  const patterns = [
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/,
    /^([^/]+)\/([^/]+)$/,
  ];
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) return { owner: match[1], repo: match[2] };
  }
  return null;
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<string | null> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
      headers: headers(token),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.content && data.encoding === 'base64') {
      return atob(data.content.replace(/\n/g, ''));
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchAllDependencyFiles(
  owner: string,
  repo: string,
  token?: string
): Promise<{ path: string; content: string }[]> {
  const results: { path: string; content: string }[] = [];

  const fetches = DEPENDENCY_FILES.map(async (filePath) => {
    const content = await fetchFileContent(owner, repo, filePath, token);
    if (content) results.push({ path: filePath, content });
  });

  await Promise.all(fetches);

  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/requirements`, {
      headers: headers(token),
    });
    if (res.ok) {
      const files = await res.json();
      if (Array.isArray(files)) {
        const extraFetches = files
          .filter((f: { name: string }) => f.name.endsWith('.txt'))
          .filter((f: { path: string }) => !DEPENDENCY_FILES.includes(f.path))
          .map(async (f: { path: string }) => {
            const content = await fetchFileContent(owner, repo, f.path, token);
            if (content) results.push({ path: f.path, content });
          });
        await Promise.all(extraFetches);
      }
    }
  } catch {
    // requirements/ directory doesn't exist, that's fine
  }

  return results;
}

export async function searchCodeForLitellm(
  owner: string,
  repo: string,
  token?: string
): Promise<{ path: string; fragment: string }[]> {
  try {
    const query = encodeURIComponent(`litellm repo:${owner}/${repo}`);
    const res = await fetch(`${GITHUB_API}/search/code?q=${query}&per_page=20`, {
      headers: {
        ...headers(token),
        Accept: 'application/vnd.github.text-match+json',
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items) return [];
    return data.items.map((item: { path: string; text_matches?: { fragment: string }[] }) => ({
      path: item.path,
      fragment: item.text_matches?.[0]?.fragment || '',
    }));
  } catch {
    return [];
  }
}

export async function checkRateLimit(token?: string): Promise<{ remaining: number; limit: number }> {
  try {
    const res = await fetch(`${GITHUB_API}/rate_limit`, { headers: headers(token) });
    const data = await res.json();
    return { remaining: data.resources.core.remaining, limit: data.resources.core.limit };
  } catch {
    return { remaining: -1, limit: -1 };
  }
}
