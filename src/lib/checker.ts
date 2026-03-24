import { COMPROMISED_VERSIONS, type RiskLevel, type FileCheckResult, type CheckResult, type SearchHit } from './types';
import { parseGitHubUrl, fetchAllDependencyFiles, searchCodeForLitellm } from './github';

function parseVersion(v: string): number[] {
  return v.split('.').map(Number);
}

function versionInRange(version: string, spec: string): boolean {
  const v = parseVersion(version);
  const specParts = spec.split(',').map(s => s.trim());

  for (const part of specParts) {
    const match = part.match(/^(>=|<=|>|<|==|!=|~=)?\s*(.+)$/);
    if (!match) continue;
    const [, op = '==', ver] = match;
    const s = parseVersion(ver);

    const cmp = (a: number[], b: number[]): number => {
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const diff = (a[i] || 0) - (b[i] || 0);
        if (diff !== 0) return diff;
      }
      return 0;
    };

    const c = cmp(v, s);
    switch (op) {
      case '==': if (c !== 0) return false; break;
      case '!=': if (c === 0) return false; break;
      case '>=': if (c < 0) return false; break;
      case '<=': if (c > 0) return false; break;
      case '>': if (c <= 0) return false; break;
      case '<': if (c >= 0) return false; break;
      case '~=': {
        if (c < 0) return false;
        const upper = [...s];
        upper[upper.length - 2] = (upper[upper.length - 2] || 0) + 1;
        upper[upper.length - 1] = 0;
        if (cmp(v, upper) >= 0) return false;
        break;
      }
    }
  }
  return true;
}

function extractLitellmSpec(content: string, filePath: string): { found: boolean; versionSpec: string | null; exactVersion: string | null } {
  const lower = filePath.toLowerCase();

  if (lower === 'poetry.lock') {
    const poetryMatch = content.match(/\[\[package\]\]\s*\nname\s*=\s*"litellm"\s*\nversion\s*=\s*"([^"]+)"/);
    if (poetryMatch) return { found: true, versionSpec: `==${poetryMatch[1]}`, exactVersion: poetryMatch[1] };
    if (/litellm/i.test(content)) return { found: true, versionSpec: null, exactVersion: null };
    return { found: false, versionSpec: null, exactVersion: null };
  }

  if (lower === 'pipfile.lock' || lower === 'pdm.lock') {
    const lockMatch = content.match(/"litellm"\s*:\s*\{[^}]*"version"\s*:\s*"==([^"]+)"/);
    if (lockMatch) return { found: true, versionSpec: `==${lockMatch[1]}`, exactVersion: lockMatch[1] };
    if (/litellm/i.test(content)) return { found: true, versionSpec: null, exactVersion: null };
    return { found: false, versionSpec: null, exactVersion: null };
  }

  if (lower === 'uv.lock') {
    const uvMatch = content.match(/\[\[package\]\]\s*\nname\s*=\s*"litellm"\s*\nversion\s*=\s*"([^"]+)"/);
    if (uvMatch) return { found: true, versionSpec: `==${uvMatch[1]}`, exactVersion: uvMatch[1] };
    if (/litellm/i.test(content)) return { found: true, versionSpec: null, exactVersion: null };
    return { found: false, versionSpec: null, exactVersion: null };
  }

  if (lower === 'pyproject.toml') {
    const depMatch = content.match(/["']litellm(?:\[.*?\])?\s*([><=!~]+[^"'\s,\]]+(?:\s*,\s*[><=!~]+[^"'\s,\]]+)*)?\s*["']/i);
    if (depMatch) {
      const spec = depMatch[1] || null;
      return { found: true, versionSpec: spec, exactVersion: spec?.startsWith('==') ? spec.slice(2) : null };
    }
    if (/litellm/i.test(content)) return { found: true, versionSpec: null, exactVersion: null };
    return { found: false, versionSpec: null, exactVersion: null };
  }

  if (lower.endsWith('.txt') || lower === 'setup.cfg' || lower === 'pipfile') {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) continue;
      const reqMatch = trimmed.match(/^litellm(?:\[.*?\])?\s*([><=!~]+.+)?$/i);
      if (reqMatch) {
        const spec = reqMatch[1]?.trim() || null;
        return { found: true, versionSpec: spec, exactVersion: spec?.startsWith('==') ? spec.slice(2) : null };
      }
    }
    return { found: false, versionSpec: null, exactVersion: null };
  }

  if (lower === 'setup.py') {
    const setupMatch = content.match(/['"]litellm(?:\[.*?\])?\s*([><=!~]+[^'"]+)?['"]/i);
    if (setupMatch) {
      const spec = setupMatch[1]?.trim() || null;
      return { found: true, versionSpec: spec, exactVersion: spec?.startsWith('==') ? spec.slice(2) : null };
    }
    return { found: false, versionSpec: null, exactVersion: null };
  }

  return { found: false, versionSpec: null, exactVersion: null };
}

function assessFileRisk(spec: { found: boolean; versionSpec: string | null; exactVersion: string | null }): RiskLevel {
  if (!spec.found) return 'SAFE';

  if (spec.exactVersion) {
    return COMPROMISED_VERSIONS.includes(spec.exactVersion as typeof COMPROMISED_VERSIONS[number]) ? 'CRITICAL' : 'LOW';
  }

  if (!spec.versionSpec) return 'HIGH';

  for (const cv of COMPROMISED_VERSIONS) {
    if (versionInRange(cv, spec.versionSpec)) return 'HIGH';
  }

  return 'LOW';
}

export async function checkRepository(url: string, token?: string): Promise<CheckResult> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return { repoFullName: url, overallRisk: 'SAFE', files: [], searchHits: [], error: 'Invalid GitHub URL. Use format: github.com/owner/repo or owner/repo' };
  }

  const { owner, repo } = parsed;
  const repoFullName = `${owner}/${repo}`;

  try {
    const [depFiles, searchResults] = await Promise.all([
      fetchAllDependencyFiles(owner, repo, token),
      searchCodeForLitellm(owner, repo, token),
    ]);

    const files: FileCheckResult[] = depFiles.map(({ path, content }) => {
      const spec = extractLitellmSpec(content, path);
      return {
        filePath: path,
        found: spec.found,
        versionSpec: spec.versionSpec,
        exactVersion: spec.exactVersion,
        riskLevel: assessFileRisk(spec),
      };
    }).filter(f => f.found);

    const searchHits: SearchHit[] = searchResults.map(r => ({
      filePath: r.path,
      matchFragment: r.fragment,
    }));

    const riskPriority: Record<RiskLevel, number> = { CRITICAL: 3, HIGH: 2, LOW: 1, SAFE: 0 };
    let overallRisk: RiskLevel = 'SAFE';
    for (const f of files) {
      if (riskPriority[f.riskLevel] > riskPriority[overallRisk]) {
        overallRisk = f.riskLevel;
      }
    }

    if (overallRisk === 'SAFE' && searchHits.length > 0) {
      const hitsDeps = searchHits.some(h =>
        /requirements|setup\.|pyproject|pipfile|poetry|\.lock/i.test(h.filePath)
      );
      if (hitsDeps) overallRisk = 'HIGH';
    }

    return { repoFullName, overallRisk, files, searchHits, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('rate limit') || msg.includes('403')) {
      return { repoFullName, overallRisk: 'SAFE', files: [], searchHits: [], error: 'GitHub API rate limit exceeded. Try adding a GitHub token for higher limits.' };
    }
    return { repoFullName, overallRisk: 'SAFE', files: [], searchHits: [], error: `Failed to check repository: ${msg}` };
  }
}
