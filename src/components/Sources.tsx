const SOURCES = [
  {
    title: 'Original security report (GitHub Issue #24512)',
    url: 'https://github.com/BerriAI/litellm/issues/24512',
  },
  {
    title: 'Official LiteLLM team response (GitHub Issue #24518)',
    url: 'https://github.com/BerriAI/litellm/issues/24518',
  },
  {
    title: 'PyPA Security Advisory — PYSEC-2026-2',
    url: 'https://github.com/pypa/advisory-database/blob/main/vulns/litellm/PYSEC-2026-2.yaml',
  },
  {
    title: 'The Register — LiteLLM infected with credential-stealing code via Trivy',
    url: 'https://www.theregister.com/2026/03/24/trivy_compromise_litellm/',
  },
  {
    title: 'Hacker News discussion',
    url: 'https://news.ycombinator.com/item?id=47501729',
  },
  {
    title: 'Trivy supply chain attack writeup — Rami McCarthy',
    url: 'https://ramimac.me/trivy-teampcp/',
  },
  {
    title: 'Aqua Security Trivy advisory (GHSA-69fq-xp46-6x23)',
    url: 'https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23',
  },
];

export default function Sources() {
  return (
    <section className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Sources &amp; references</h2>
        <div className="space-y-2">
          {SOURCES.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-400 transition-colors group"
            >
              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                {source.title}
              </div>
              <div className="text-xs text-gray-400 font-mono mt-0.5 truncate">{source.url}</div>
            </a>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            Built to help the community respond to the LiteLLM supply chain attack.{' '}
            <a
              href="https://github.com/saharmor/lite-llm-map"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-red-600 underline"
            >
              Source on GitHub
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
