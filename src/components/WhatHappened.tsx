export default function WhatHappened() {
  return (
    <section className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">What happened?</h2>

        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            On <strong>March 24, 2026</strong>, an attacker published malicious versions of{' '}
            <a href="https://github.com/BerriAI/litellm" className="text-red-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">LiteLLM</a>{' '}
            (a popular Python library with ~95M monthly downloads) to PyPI. The attack was part of a larger supply chain compromise
            originating from the{' '}
            <a href="https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23" className="text-red-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">Trivy vulnerability scanner</a>.
          </p>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">The attack chain:</h3>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-none w-7 h-7 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span>
                  <strong>Trivy compromised</strong> — TeamPCP attackers hijacked Trivy (a vulnerability scanner) and pushed malicious versions
                  that steal CI/CD secrets.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-7 h-7 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span>
                  <strong>LiteLLM's CI ran Trivy</strong> — LiteLLM's CI/CD pipeline used Trivy without version pinning. A CI run pulled
                  the poisoned Trivy, which exfiltrated the <code className="bg-gray-100 px-1 rounded text-sm">PYPI_PUBLISH_PASSWORD</code>.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-7 h-7 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span>
                  <strong>Malicious versions published</strong> — Using the stolen PyPI token, the attacker published
                  litellm 1.82.7 and 1.82.8 directly to PyPI (these versions never existed on GitHub).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-7 h-7 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span>
                  <strong>Credentials stolen</strong> — The malware collects SSH keys, API tokens, cloud credentials (AWS/GCP/Azure),
                  Kubernetes secrets, crypto wallets, and more — then encrypts and exfiltrates them.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
