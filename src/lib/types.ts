export const COMPROMISED_VERSIONS = ['1.82.7', '1.82.8'] as const;
export const LAST_SAFE_VERSION = '1.82.6';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'LOW' | 'SAFE';

export interface FileCheckResult {
  filePath: string;
  found: boolean;
  versionSpec: string | null;
  exactVersion: string | null;
  riskLevel: RiskLevel;
}

export interface CheckResult {
  repoFullName: string;
  overallRisk: RiskLevel;
  files: FileCheckResult[];
  searchHits: SearchHit[];
  error: string | null;
}

export interface SearchHit {
  filePath: string;
  matchFragment: string;
}

export interface AffectedProject {
  name: string;
  url: string;
  issueUrl: string;
  description: string;
}

export const KNOWN_AFFECTED_PROJECTS: AffectedProject[] = [
  { name: 'google/adk-python', url: 'https://github.com/google/adk-python', issueUrl: 'https://github.com/google/adk-python/issues/4981', description: 'Google Agent Development Kit for Python' },
  { name: 'stanfordnlp/dspy', url: 'https://github.com/stanfordnlp/dspy', issueUrl: 'https://github.com/stanfordnlp/dspy/issues/9499', description: 'Stanford NLP framework for LM programs' },
  { name: 'OpenHands/OpenHands', url: 'https://github.com/OpenHands/OpenHands', issueUrl: 'https://github.com/OpenHands/OpenHands/issues/13567', description: 'AI software development agents' },
  { name: 'guardrails-ai/guardrails', url: 'https://github.com/guardrails-ai/guardrails', issueUrl: 'https://github.com/guardrails-ai/guardrails/issues/1445', description: 'Input/output guards for LLMs' },
  { name: 'unclecode/crawl4ai', url: 'https://github.com/unclecode/crawl4ai', issueUrl: 'https://github.com/unclecode/crawl4ai/issues/1864', description: 'Web crawling framework for AI' },
  { name: 'neuml/txtai', url: 'https://github.com/neuml/txtai', issueUrl: 'https://github.com/neuml/txtai/issues/1065', description: 'Semantic search and LLM workflows' },
  { name: 'microsoft/agent-framework', url: 'https://github.com/microsoft/agent-framework', issueUrl: 'https://github.com/microsoft/agent-framework/issues/4886', description: 'Microsoft Agent Framework' },
  { name: 'getsentry/sentry-python', url: 'https://github.com/getsentry/sentry-python', issueUrl: 'https://github.com/getsentry/sentry-python/issues/5856', description: 'Sentry SDK for Python' },
  { name: 'astronomer/astronomer-cosmos', url: 'https://github.com/astronomer/astronomer-cosmos', issueUrl: 'https://github.com/astronomer/astronomer-cosmos/pull/2499', description: 'Run dbt with Apache Airflow' },
  { name: 'UKGovernmentBEIS/control-arena', url: 'https://github.com/UKGovernmentBEIS/control-arena', issueUrl: 'https://github.com/UKGovernmentBEIS/control-arena/pull/786', description: 'UK Government AI safety evaluation' },
  { name: 'notebook-intelligence/notebook-intelligence', url: 'https://github.com/notebook-intelligence/notebook-intelligence', issueUrl: 'https://github.com/notebook-intelligence/notebook-intelligence/issues/125', description: 'AI-powered Jupyter notebooks' },
];

export const DEPENDENCY_FILES = [
  'requirements.txt',
  'requirements/base.txt',
  'requirements/main.txt',
  'requirements/prod.txt',
  'requirements/dev.txt',
  'setup.py',
  'setup.cfg',
  'pyproject.toml',
  'Pipfile',
  'Pipfile.lock',
  'poetry.lock',
  'uv.lock',
  'pdm.lock',
];
