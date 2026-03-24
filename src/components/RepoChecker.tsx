import { useState } from 'react';
import { checkRepository } from '../lib/checker';
import type { CheckResult, Status } from '../lib/types';

const STATUS_CONFIG: Record<Status, { bg: string; border: string; text: string; label: string; description: string }> = {
  COMPROMISED: {
    bg: 'bg-danger-muted',
    border: 'border-danger/30',
    text: 'text-danger',
    label: 'Currently compromised',
    description: 'A compromised version (1.82.7 or 1.82.8) is pinned in your lockfile. Rotate all credentials immediately.',
  },
  AT_RISK: {
    bg: 'bg-warning-muted',
    border: 'border-warning/30',
    text: 'text-warning',
    label: 'Currently at risk',
    description: 'LiteLLM is in your dependencies without a safe version pin. You may have installed a compromised version.',
  },
  PATCHED: {
    bg: 'bg-success-muted',
    border: 'border-success/30',
    text: 'text-success',
    label: 'Patched',
    description: 'LiteLLM is in your dependencies, pinned to a safe version. If you previously ran an unpinned install, credentials may still have been exposed.',
  },
  PREVIOUSLY_USED: {
    bg: 'bg-warning-muted',
    border: 'border-warning/30',
    text: 'text-warning',
    label: 'Previously used',
    description: 'LiteLLM was found in your codebase but is no longer a direct dependency. If it was installed during the compromise window, credentials may have been exposed.',
  },
  NOT_FOUND: {
    bg: 'bg-success-muted',
    border: 'border-success/30',
    text: 'text-success',
    label: 'Not affected',
    description: 'No trace of LiteLLM found in this repository.',
  },
};

export default function RepoChecker() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const handleCheck = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await checkRepository(url.trim(), token.trim() || undefined);
      setResult(res);
    } catch {
      setResult({
        repoFullName: url,
        currentStatus: 'NOT_FOUND',
        files: [],
        searchHits: [],
        error: 'Something went wrong. Please check the URL and try again.',
      });
    }
    setLoading(false);
  };

  const config = result ? STATUS_CONFIG[result.currentStatus] : null;

  return (
    <section id="checker" className="pb-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white/60 backdrop-blur rounded-xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 mb-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              placeholder="https://github.com/owner/repo"
              className="flex-1 px-4 py-3 bg-ivory border border-border-strong rounded-lg text-base font-[family-name:var(--font-body)] focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay placeholder:text-text-tertiary"
            />
            <button
              onClick={handleCheck}
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-clay text-white font-semibold rounded-lg hover:bg-clay-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Checking...
                </span>
              ) : (
                'Check'
              )}
            </button>
          </div>

          <button
            onClick={() => setShowToken(!showToken)}
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
          >
            {showToken ? 'Hide token field' : 'Add GitHub token for higher rate limits'}
          </button>

          {showToken && (
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxx (optional, stays in your browser)"
              className="w-full mt-2 px-3 py-2 bg-ivory border border-border rounded-lg text-sm font-[family-name:var(--font-body)] focus:outline-none focus:ring-2 focus:ring-clay/40 placeholder:text-text-tertiary"
            />
          )}

          {result?.error && (
            <div className="mt-4 p-4 bg-danger-muted border border-danger/20 rounded-lg text-danger text-sm">
              {result.error}
            </div>
          )}

          {result && !result.error && config && (
            <div className={`mt-5 p-5 ${config.bg} border ${config.border} rounded-xl`}>
              <div className="flex items-start gap-3">
                <div className={`flex-none w-2 h-2 rounded-full mt-2 ${
                  result.currentStatus === 'COMPROMISED' ? 'bg-danger' :
                  result.currentStatus === 'AT_RISK' || result.currentStatus === 'PREVIOUSLY_USED' ? 'bg-warning' :
                  'bg-success'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className={`text-lg font-semibold font-[family-name:var(--font-heading)] ${config.text}`}>
                      {config.label}
                    </h3>
                    <span className="text-text-tertiary text-sm font-mono truncate">{result.repoFullName}</span>
                  </div>
                  <p className="text-text-secondary text-sm mt-1">{config.description}</p>

                  {result.files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {result.files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2 text-sm">
                          <span className="font-mono text-text-primary truncate">{f.filePath}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded flex-none ml-2 ${
                            f.status === 'COMPROMISED' ? 'bg-danger/10 text-danger' :
                            f.status === 'AT_RISK' ? 'bg-warning/10 text-warning' :
                            'bg-success/10 text-success'
                          }`}>
                            {f.versionSpec || 'unpinned'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.searchHits.length > 0 && result.files.length === 0 && (
                    <div className="mt-3 text-xs text-text-tertiary">
                      Found in: {result.searchHits.slice(0, 5).map(h => h.filePath).join(', ')}
                      {result.searchHits.length > 5 && ` +${result.searchHits.length - 5} more`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
