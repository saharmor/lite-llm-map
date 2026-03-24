import { useState } from 'react';

export default function QuickFacts() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-text-primary mb-4">What happened</h2>
        <p className="text-text-secondary leading-relaxed mb-6">
          An attacker compromised{' '}
          <a href="https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23" className="text-clay hover:underline" target="_blank" rel="noopener noreferrer">Trivy</a>
          {' '}(a vulnerability scanner), used it to steal LiteLLM's PyPI publishing token from CI/CD,
          then published two malicious versions that steal credentials from any machine they run on.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-white/60 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-danger/10 text-danger text-xs font-semibold px-2 py-0.5 rounded">Malicious</span>
              <code className="text-text-primary font-semibold">v1.82.7</code>
            </div>
            <p className="text-sm text-text-secondary">
              Payload in <code className="bg-surface-raised px-1 rounded text-xs">proxy_server.py</code>.
              Triggered on <code className="bg-surface-raised px-1 rounded text-xs">import litellm.proxy</code>.
            </p>
          </div>
          <div className="bg-white/60 border border-danger/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-danger text-white text-xs font-semibold px-2 py-0.5 rounded">Most dangerous</span>
              <code className="text-text-primary font-semibold">v1.82.8</code>
            </div>
            <p className="text-sm text-text-secondary">
              Added a <code className="bg-surface-raised px-1 rounded text-xs">.pth</code> file that
              runs on <strong>any Python startup</strong> — no import needed.
            </p>
          </div>
        </div>

        <div className="text-sm text-text-tertiary mb-4">
          Last safe version: <code className="font-semibold text-success">v1.82.6</code>
          <span className="mx-2">&middot;</span>
          Both malicious versions have been yanked from PyPI.
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-clay hover:text-clay-hover transition-colors cursor-pointer"
        >
          {expanded ? 'Hide' : 'Show'} full attack chain
        </button>

        {expanded && (
          <ol className="mt-4 space-y-3 text-sm text-text-secondary border-l-2 border-border pl-4">
            <li>
              <strong className="text-text-primary">Trivy hijacked</strong> — TeamPCP pushed malicious Trivy versions that
              steal CI/CD secrets via Cloudflare Tunnels.
            </li>
            <li>
              <strong className="text-text-primary">LiteLLM CI ran poisoned Trivy</strong> — without version pinning, CI
              pulled the compromised Trivy which exfiltrated <code className="bg-surface-raised px-1 rounded">PYPI_PUBLISH_PASSWORD</code>.
            </li>
            <li>
              <strong className="text-text-primary">Attacker published to PyPI</strong> — versions 1.82.7 and 1.82.8 were
              uploaded directly (they never existed on GitHub).
            </li>
            <li>
              <strong className="text-text-primary">Credentials exfiltrated</strong> — the malware collects SSH keys,
              cloud credentials, API tokens, crypto wallets, and more, encrypted with AES-256 + RSA-4096
              and sent to <code className="bg-surface-raised px-1 rounded">models.litellm.cloud</code>.
            </li>
          </ol>
        )}
      </div>
    </section>
  );
}
