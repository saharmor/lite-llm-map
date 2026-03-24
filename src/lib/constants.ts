export const COMPROMISED_VERSIONS = ['1.82.7', '1.82.8'] as const;
export const LAST_SAFE_VERSION = '1.82.6';
export const ATTACK_DATE = 'March 24, 2026';

export const MALWARE_COLLECTION_ITEMS = [
  'SSH keys (~/.ssh/)',
  'All environment variables',
  'AWS / GCP / Azure credentials',
  'Kubernetes secrets',
  'Git credentials',
  'Docker configs',
  'Crypto wallets',
  'Shell history',
  'Database passwords',
  'SSL/TLS private keys',
  'CI/CD configs',
  'Slack/Discord webhooks',
] as const;

export const SOURCE_REPO_URL =
  import.meta.env.VITE_APP_REPO_URL || 'https://github.com/saharmor/lite-llm-map';
