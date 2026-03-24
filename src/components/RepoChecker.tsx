import { useState } from 'react';
import { checkRepository } from '../lib/checker';
import type { CheckResult, RiskLevel } from '../lib/types';

const RISK_STYLES: Record<RiskLevel, { bg: string; border: string; text: string; icon: string; label: string }> = {
  CRITICAL: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', icon: '🚨', label: 'CRITICAL — Compromised version detected' },
  HIGH: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-800', icon: '⚠️', label: 'HIGH RISK — LiteLLM found, may include compromised versions' },
  LOW: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', icon: '📋', label: 'LOW RISK — LiteLLM found but pinned to safe version' },
  SAFE: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', icon: '✅', label: 'SAFE — No LiteLLM dependency detected' },
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
        overallRisk: 'SAFE',
        files: [],
        searchHits: [],
        error: 'Something went wrong. Please check the URL and try again.',
      });
    }
    setLoading(false);
  };

  const style = result ? RISK_STYLES[result.overallRisk] : null;

  return (
    <section id="checker" className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Check your project</h2>
        <p className="text-gray-600 mb-6">
          Paste a GitHub repository URL to check if it uses or has used a compromised LiteLLM version.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            placeholder="https://github.com/owner/repo"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            onClick={handleCheck}
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Checking...
              </span>
            ) : (
              'Check Repository'
            )}
          </button>
        </div>

        <button
          onClick={() => setShowToken(!showToken)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          {showToken ? '▾ Hide' : '▸ Optional:'} GitHub token for higher rate limits
        </button>

        {showToken && (
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (optional, stays in your browser)"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        )}

        {result?.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {result.error}
          </div>
        )}

        {result && !result.error && style && (
          <div className={`mt-6 p-6 ${style.bg} border-2 ${style.border} rounded-xl`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{style.icon}</span>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${style.text}`}>{style.label}</h3>
                <p className={`text-sm mt-1 ${style.text} opacity-80`}>
                  Repository: <span className="font-mono font-semibold">{result.repoFullName}</span>
                </p>

                {result.files.length > 0 && (
                  <div className="mt-4">
                    <h4 className={`text-sm font-semibold ${style.text} mb-2`}>Dependency files with LiteLLM:</h4>
                    <div className="space-y-2">
                      {result.files.map((f, i) => (
                        <div key={i} className="bg-white/70 rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-gray-800">{f.filePath}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              f.riskLevel === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                              f.riskLevel === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                              f.riskLevel === 'LOW' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-green-200 text-green-800'
                            }`}>{f.riskLevel}</span>
                          </div>
                          {f.versionSpec && (
                            <p className="text-gray-600 mt-1">
                              Version: <span className="font-mono">{f.versionSpec}</span>
                            </p>
                          )}
                          {!f.versionSpec && (
                            <p className="text-gray-600 mt-1">No version pinned (could install any version)</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.searchHits.length > 0 && (
                  <div className="mt-4">
                    <h4 className={`text-sm font-semibold ${style.text} mb-2`}>Other files referencing LiteLLM:</h4>
                    <div className="space-y-1">
                      {result.searchHits.slice(0, 10).map((h, i) => (
                        <div key={i} className="text-sm font-mono text-gray-700">
                          {h.filePath}
                        </div>
                      ))}
                      {result.searchHits.length > 10 && (
                        <div className="text-sm text-gray-500">...and {result.searchHits.length - 10} more</div>
                      )}
                    </div>
                  </div>
                )}

                {result.overallRisk !== 'SAFE' && (
                  <div className="mt-4 pt-4 border-t border-current/10">
                    <p className={`text-sm font-medium ${style.text}`}>
                      {result.overallRisk === 'CRITICAL'
                        ? 'Immediate action required: rotate ALL credentials on systems where this was installed.'
                        : result.overallRisk === 'HIGH'
                        ? 'Check if litellm 1.82.7 or 1.82.8 was ever installed. If so, rotate all credentials immediately.'
                        : 'Your version appears safe, but verify no transitive dependency pulled a compromised version.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
