import { useState } from 'react';
import { COMPROMISED_VERSIONS, LAST_SAFE_VERSION, MALWARE_COLLECTION_ITEMS } from '../lib/constants';

export default function Remediation() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <section className="py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-text-primary mb-4">What to do</h2>

        <div className="bg-white/60 border border-border rounded-xl p-5 space-y-3">
          {[
            { n: '1', text: <>Check for <code className="bg-surface-raised px-1 rounded text-sm">litellm_init.pth</code> in your <code className="bg-surface-raised px-1 rounded text-sm">site-packages/</code></> },
            { n: '2', text: <><strong>Rotate all credentials</strong> on any machine where LiteLLM {COMPROMISED_VERSIONS.join(' or ')} was installed: SSH keys, API tokens, cloud creds, DB passwords</> },
            { n: '3', text: <>Audit CI/CD pipelines; if litellm was installed during CI, those secrets are compromised too</> },
            { n: '4', text: <>Pin to <code className="bg-surface-raised px-1 rounded text-sm font-semibold">litellm=={LAST_SAFE_VERSION}</code> or earlier</> },
          ].map(({ n, text }) => (
            <div key={n} className="flex gap-3 text-sm text-text-secondary">
              <span className="flex-none w-5 h-5 bg-surface-raised text-text-tertiary rounded-full flex items-center justify-center text-xs font-semibold">{n}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 text-sm text-clay hover:text-clay-hover transition-colors cursor-pointer"
        >
          {showDetails ? 'Hide' : 'Show'} what the malware collects
        </button>

        {showDetails && (
          <div className="mt-3 bg-white/60 border border-border rounded-lg p-4 text-sm text-text-secondary grid sm:grid-cols-2 gap-1.5">
            {MALWARE_COLLECTION_ITEMS.map((item) => (
              <span key={item} className="flex gap-1.5">
                <span className="text-text-tertiary">&middot;</span> {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
