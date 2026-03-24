export type Status = 'COMPROMISED' | 'AT_RISK' | 'PATCHED' | 'PREVIOUSLY_USED' | 'NOT_FOUND';

export interface FileCheckResult {
  filePath: string;
  found: boolean;
  versionSpec: string | null;
  exactVersion: string | null;
  status: Status;
}

export interface CheckResult {
  repoFullName: string;
  currentStatus: Status;
  files: FileCheckResult[];
  searchHits: SearchHit[];
  error: string | null;
  warning: string | null;
}

export interface SearchHit {
  filePath: string;
  matchFragment: string;
}

export interface RepositoryContext {
  owner: string;
  repo: string;
  repoFullName: string;
  defaultBranch: string;
}

export interface DependencyFileContent {
  path: string;
  content: string;
}

export interface DependencyScanResult {
  files: DependencyFileContent[];
  incomplete: boolean;
}

export interface CodeSearchResult {
  hits: SearchHit[];
  incomplete: boolean;
}

export interface AffectedProject {
  name: string;
  url: string;
  issueUrl: string;
  description: string;
}

export const KNOWN_AFFECTED_PROJECTS: AffectedProject[] = [
  { name: 'google/adk-python', url: 'https://github.com/google/adk-python', issueUrl: 'https://github.com/google/adk-python/issues/4981', description: 'Google Agent Development Kit' },
  { name: 'stanfordnlp/dspy', url: 'https://github.com/stanfordnlp/dspy', issueUrl: 'https://github.com/stanfordnlp/dspy/issues/9499', description: 'Stanford NLP framework' },
  { name: 'OpenHands/OpenHands', url: 'https://github.com/OpenHands/OpenHands', issueUrl: 'https://github.com/OpenHands/OpenHands/issues/13567', description: 'AI dev agents' },
  { name: 'guardrails-ai/guardrails', url: 'https://github.com/guardrails-ai/guardrails', issueUrl: 'https://github.com/guardrails-ai/guardrails/issues/1445', description: 'LLM guardrails' },
  { name: 'unclecode/crawl4ai', url: 'https://github.com/unclecode/crawl4ai', issueUrl: 'https://github.com/unclecode/crawl4ai/issues/1864', description: 'Web crawling for AI' },
  { name: 'neuml/txtai', url: 'https://github.com/neuml/txtai', issueUrl: 'https://github.com/neuml/txtai/issues/1065', description: 'Semantic search' },
  { name: 'microsoft/agent-framework', url: 'https://github.com/microsoft/agent-framework', issueUrl: 'https://github.com/microsoft/agent-framework/issues/4886', description: 'MS Agent Framework' },
  { name: 'getsentry/sentry-python', url: 'https://github.com/getsentry/sentry-python', issueUrl: 'https://github.com/getsentry/sentry-python/issues/5856', description: 'Sentry SDK' },
  { name: 'astronomer/astronomer-cosmos', url: 'https://github.com/astronomer/astronomer-cosmos', issueUrl: 'https://github.com/astronomer/astronomer-cosmos/pull/2499', description: 'dbt + Airflow' },
  { name: 'UKGovernmentBEIS/control-arena', url: 'https://github.com/UKGovernmentBEIS/control-arena', issueUrl: 'https://github.com/UKGovernmentBEIS/control-arena/pull/786', description: 'AI safety eval' },
  { name: 'notebook-intelligence/notebook-intelligence', url: 'https://github.com/notebook-intelligence/notebook-intelligence', issueUrl: 'https://github.com/notebook-intelligence/notebook-intelligence/issues/125', description: 'AI Jupyter notebooks' },
];

export const DEPENDENCY_FILES = [
  'requirements.txt',
  'setup.py',
  'setup.cfg',
  'pyproject.toml',
  'Pipfile',
  'Pipfile.lock',
  'poetry.lock',
  'uv.lock',
  'pdm.lock',
];
