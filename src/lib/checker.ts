import { COMPROMISED_VERSIONS } from './constants';
import { fetchAllDependencyFiles, fetchRepositoryContext, looksLikeDependencyFilePath, parseGitHubUrl, searchCodeForLitellm } from './github';
import type { CheckResult, FileCheckResult, SearchHit, Status } from './types';

type DependencySpec = {
  versionSpec: string | null;
  exactVersion: string | null;
};

type RangeMatch = 'match' | 'no-match' | 'unknown';

const STATUS_PRIORITY: Record<Status, number> = {
  COMPROMISED: 4,
  AT_RISK: 3,
  PATCHED: 2,
  PREVIOUSLY_USED: 1,
  NOT_FOUND: 0,
};

const NON_SOURCE_SEGMENTS = new Set([
  'docs',
  'doc',
  'example',
  'examples',
  'sample',
  'samples',
  'fixture',
  'fixtures',
  'vendor',
  'dist',
  'build',
  'site',
]);

function stripInlineComment(value: string): string {
  return value.replace(/\s+#.*$/, '').trim();
}

function normalizeVersionSpec(spec: string | null | undefined): string | null {
  if (!spec) {
    return null;
  }

  const normalized = stripInlineComment(spec).split(';')[0].trim();
  return normalized || null;
}

function extractExactVersion(spec: string | null): string | null {
  const match = spec?.match(/^==\s*(\d+(?:\.\d+)+)$/);
  return match ? match[1] : null;
}

function buildDependencySpec(spec: string | null): DependencySpec {
  const versionSpec = normalizeVersionSpec(spec);
  return {
    versionSpec,
    exactVersion: extractExactVersion(versionSpec),
  };
}

function dedupeSpecs(specs: DependencySpec[]): DependencySpec[] {
  return Array.from(
    new Map(specs.map((spec) => [`${spec.versionSpec ?? 'unpinned'}:${spec.exactVersion ?? ''}`, spec])).values()
  );
}

function parseReleaseVersion(version: string): number[] | null {
  const match = version.trim().match(/\d+(?:\.\d+)*/);
  if (!match) {
    return null;
  }

  const parsed = match[0].split('.').map(Number);
  return parsed.some(Number.isNaN) ? null : parsed;
}

function compareVersions(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

function versionInRange(version: string, spec: string): RangeMatch {
  const normalized = normalizeVersionSpec(spec);
  if (!normalized) {
    return 'unknown';
  }

  const parts = normalized.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    return 'unknown';
  }

  const candidate = parseReleaseVersion(version);
  if (!candidate) {
    return 'unknown';
  }

  for (const part of parts) {
    const match = part.match(/^(>=|<=|>|<|==|!=|~=)?\s*(.+)$/);
    if (!match) {
      return 'unknown';
    }

    const [, op = '==', rawVersion] = match;
    const target = parseReleaseVersion(rawVersion);
    if (!target) {
      return 'unknown';
    }

    const comparison = compareVersions(candidate, target);
    switch (op) {
      case '==':
        if (comparison !== 0) return 'no-match';
        break;
      case '!=':
        if (comparison === 0) return 'no-match';
        break;
      case '>=':
        if (comparison < 0) return 'no-match';
        break;
      case '<=':
        if (comparison > 0) return 'no-match';
        break;
      case '>':
        if (comparison <= 0) return 'no-match';
        break;
      case '<':
        if (comparison >= 0) return 'no-match';
        break;
      case '~=': {
        if (comparison < 0 || target.length < 2) {
          return 'unknown';
        }

        const upper = [...target];
        const upperIndex = Math.max(target.length - 2, 0);
        upper[upperIndex] = (upper[upperIndex] || 0) + 1;
        for (let i = upperIndex + 1; i < upper.length; i += 1) {
          upper[i] = 0;
        }

        if (compareVersions(candidate, upper) >= 0) {
          return 'no-match';
        }
        break;
      }
      default:
        return 'unknown';
    }
  }

  return 'match';
}

function assessDependencyStatus(spec: DependencySpec): Status {
  if (spec.exactVersion) {
    return COMPROMISED_VERSIONS.includes(spec.exactVersion as typeof COMPROMISED_VERSIONS[number])
      ? 'COMPROMISED'
      : 'PATCHED';
  }

  if (!spec.versionSpec) {
    return 'AT_RISK';
  }

  let sawUnknownClause = false;
  for (const compromisedVersion of COMPROMISED_VERSIONS) {
    const result = versionInRange(compromisedVersion, spec.versionSpec);
    if (result === 'match') {
      return 'AT_RISK';
    }

    if (result === 'unknown') {
      sawUnknownClause = true;
    }
  }

  return sawUnknownClause ? 'AT_RISK' : 'PATCHED';
}

function extractLockfileSpecs(content: string, fileName: string): DependencySpec[] {
  if (fileName === 'poetry.lock' || fileName === 'uv.lock') {
    return dedupeSpecs(
      Array.from(
        content.matchAll(/\[\[package\]\][\s\S]*?name\s*=\s*"litellm"[\s\S]*?version\s*=\s*"([^"]+)"/gi)
      ).map((match) => buildDependencySpec(`==${match[1]}`))
    );
  }

  if (fileName === 'pipfile.lock' || fileName === 'pdm.lock') {
    return dedupeSpecs(
      Array.from(
        content.matchAll(/"litellm"\s*:\s*\{[\s\S]*?"version"\s*:\s*"==([^"]+)"/gi)
      ).map((match) => buildDependencySpec(`==${match[1]}`))
    );
  }

  return [];
}

function extractLineBasedSpecs(content: string): DependencySpec[] {
  const matches: DependencySpec[] = [];

  for (const rawLine of content.split('\n')) {
    const line = stripInlineComment(rawLine);
    if (!/litellm/i.test(line)) {
      continue;
    }

    let sawMatch = false;

    for (const match of line.matchAll(/["']litellm(?:\[.*?\])?\s*([^"']*)["']/gi)) {
      matches.push(buildDependencySpec(match[1] || null));
      sawMatch = true;
    }

    for (const match of line.matchAll(/\blitellm(?:\[.*?\])?\s*=\s*["']([^"']*)["']/gi)) {
      matches.push(buildDependencySpec(match[1] || null));
      sawMatch = true;
    }

    const bareRequirement = line.match(/^\s*litellm(?:\[.*?\])?\s*(.*)$/i);
    if (bareRequirement) {
      matches.push(buildDependencySpec(bareRequirement[1] || null));
      sawMatch = true;
    }

    if (!sawMatch) {
      matches.push(buildDependencySpec(null));
    }
  }

  return dedupeSpecs(matches);
}

function buildFileCheckResult(filePath: string, content: string): FileCheckResult | null {
  const fileName = filePath.toLowerCase().split('/').pop() ?? filePath.toLowerCase();
  const specs = dedupeSpecs([
    ...extractLockfileSpecs(content, fileName),
    ...extractLineBasedSpecs(content),
  ]);

  if (specs.length === 0) {
    return null;
  }

  const status = specs.reduce<Status>((current, spec) => {
    const next = assessDependencyStatus(spec);
    return STATUS_PRIORITY[next] > STATUS_PRIORITY[current] ? next : current;
  }, 'NOT_FOUND');

  const versionSpecs = specs
    .map((spec) => spec.versionSpec)
    .filter((spec): spec is string => Boolean(spec));

  const exactVersions = Array.from(
    new Set(specs.map((spec) => spec.exactVersion).filter((version): version is string => Boolean(version)))
  );

  return {
    filePath,
    found: true,
    versionSpec: versionSpecs.length > 0 ? versionSpecs.join(' | ') : null,
    exactVersion: exactVersions.length === 1 ? exactVersions[0] : null,
    status,
  };
}

function isMeaningfulSearchHit(hit: SearchHit): boolean {
  const lower = hit.filePath.toLowerCase();
  const segments = lower.split('/');

  if (looksLikeDependencyFilePath(lower)) {
    return true;
  }

  if (segments.some((segment) => NON_SOURCE_SEGMENTS.has(segment))) {
    return false;
  }

  if (/\.(md|rst|txt)$/i.test(lower) && !looksLikeDependencyFilePath(lower)) {
    return false;
  }

  return /\.(py|pyi|ipynb|cfg|toml|ini|ya?ml|json)$/i.test(lower);
}

function deriveCurrentStatus(files: FileCheckResult[]): Status {
  return files.reduce<Status>((current, file) => {
    return STATUS_PRIORITY[file.status] > STATUS_PRIORITY[current] ? file.status : current;
  }, 'NOT_FOUND');
}

function buildIncompleteCheckError(repoFullName: string, dependencyScanIncomplete: boolean, codeSearchIncomplete: boolean): string {
  const reasons = [];

  if (dependencyScanIncomplete) {
    reasons.push('some dependency files could not be read');
  }

  if (codeSearchIncomplete) {
    reasons.push('GitHub code search was unavailable');
  }

  return `Could not fully verify ${repoFullName}: ${reasons.join(' and ')}. Add a GitHub token and try again before treating this repo as clean.`;
}

function buildWarning(dependencyScanIncomplete: boolean, codeSearchIncomplete: boolean): string | null {
  const warnings = [];

  if (dependencyScanIncomplete) {
    warnings.push('Some dependency files could not be read.');
  }

  if (codeSearchIncomplete) {
    warnings.push('GitHub code search is unavailable without a token, so historical usage could not be checked. Add a GitHub token for a complete scan.');
  }

  return warnings.length > 0 ? warnings.join(' ') : null;
}

export async function checkRepository(url: string, token?: string): Promise<CheckResult> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return {
      repoFullName: url,
      currentStatus: 'NOT_FOUND',
      files: [],
      searchHits: [],
      error: 'Invalid GitHub URL. Use format: github.com/owner/repo or owner/repo',
      warning: null,
    };
  }

  const repoFullName = `${parsed.owner}/${parsed.repo}`;

  try {
    const repository = await fetchRepositoryContext(parsed.owner, parsed.repo, token);
    const [dependencyScan, codeSearch] = await Promise.all([
      fetchAllDependencyFiles(repository, token),
      searchCodeForLitellm(repository, token),
    ]);

    const files = dependencyScan.files
      .map((file) => buildFileCheckResult(file.path, file.content))
      .filter((file): file is FileCheckResult => file !== null);

    const searchHits = codeSearch.hits.filter(isMeaningfulSearchHit);
    let currentStatus = deriveCurrentStatus(files);

    if (currentStatus === 'NOT_FOUND' && searchHits.length > 0) {
      currentStatus = 'PREVIOUSLY_USED';
    }

    if (currentStatus === 'NOT_FOUND' && dependencyScan.incomplete) {
      return {
        repoFullName: repository.repoFullName,
        currentStatus,
        files,
        searchHits,
        error: buildIncompleteCheckError(repository.repoFullName, dependencyScan.incomplete, codeSearch.incomplete),
        warning: null,
      };
    }

    return {
      repoFullName: repository.repoFullName,
      currentStatus,
      files,
      searchHits,
      error: null,
      warning: buildWarning(dependencyScan.incomplete, codeSearch.incomplete),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      repoFullName,
      currentStatus: 'NOT_FOUND',
      files: [],
      searchHits: [],
      error: message,
      warning: null,
    };
  }
}
