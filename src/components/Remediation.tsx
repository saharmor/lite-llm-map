export default function Remediation() {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">What to do if you're affected</h2>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="font-bold text-red-800 mb-3 text-lg">Immediate actions</h3>
            <ol className="space-y-3 text-red-900 text-sm">
              <li className="flex gap-3">
                <span className="flex-none w-6 h-6 bg-red-200 text-red-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>
                  <strong>Check for the malicious file:</strong> Look for <code className="bg-red-100 px-1 rounded">litellm_init.pth</code>{' '}
                  in your Python <code className="bg-red-100 px-1 rounded">site-packages/</code> directory.
                  Run: <code className="bg-red-100 px-1.5 py-0.5 rounded block mt-1">find / -name "litellm_init.pth" 2&gt;/dev/null</code>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-6 h-6 bg-red-200 text-red-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>
                  <strong>Rotate ALL credentials</strong> that were present as environment variables or config files
                  on any machine where litellm 1.82.7 or 1.82.8 was installed. This includes SSH keys, API keys,
                  cloud credentials (AWS/GCP/Azure), database passwords, and any tokens.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-6 h-6 bg-red-200 text-red-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>
                  <strong>Check CI/CD pipelines.</strong> If litellm was installed during CI runs, your CI secrets
                  may be compromised too.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-6 h-6 bg-red-200 text-red-800 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>
                  <strong>Pin your litellm version</strong> to <code className="bg-red-100 px-1 rounded">litellm==1.82.6</code>{' '}
                  or earlier until the maintainers confirm the package is clean.
                </span>
              </li>
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-bold text-amber-800 mb-3">What the malware collects</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-amber-900">
              {[
                'SSH keys (~/.ssh/)',
                'Environment variables (all API keys)',
                'AWS credentials (~/.aws/)',
                'GCP credentials (~/.config/gcloud/)',
                'Azure credentials (~/.azure/)',
                'Kubernetes secrets (~/.kube/config)',
                'Git credentials (~/.git-credentials)',
                'Docker configs (~/.docker/)',
                'Crypto wallets (Bitcoin, Ethereum, etc.)',
                'Shell history (bash, zsh)',
                'Database passwords (PostgreSQL, MySQL, Redis)',
                'SSL/TLS private keys',
                'CI/CD configs (Terraform, Jenkins, GitLab CI)',
                'Slack/Discord webhook URLs',
              ].map((item) => (
                <div key={item} className="flex gap-2">
                  <span className="text-amber-500 flex-none">&#x2022;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
