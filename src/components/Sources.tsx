const SOURCES = [
  { title: 'Original security report (#24512)', url: 'https://github.com/BerriAI/litellm/issues/24512' },
  { title: 'LiteLLM team response (#24518)', url: 'https://github.com/BerriAI/litellm/issues/24518' },
  { title: 'PyPA Advisory — PYSEC-2026-2', url: 'https://github.com/pypa/advisory-database/blob/main/vulns/litellm/PYSEC-2026-2.yaml' },
  { title: 'The Register coverage', url: 'https://www.theregister.com/2026/03/24/trivy_compromise_litellm/' },
  { title: 'Hacker News discussion', url: 'https://news.ycombinator.com/item?id=47501729' },
  { title: 'Trivy attack writeup — Rami McCarthy', url: 'https://ramimac.me/trivy-teampcp/' },
  { title: 'Aqua Security Trivy advisory', url: 'https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23' },
];

export default function Sources() {
  return (
    <footer className="py-10 border-t border-border">
      <div className="max-w-2xl mx-auto px-4">
        <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">Sources</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {SOURCES.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-secondary hover:text-clay transition-colors"
            >
              {s.title}
            </a>
          ))}
        </div>
        <p className="mt-6 text-xs text-text-tertiary">
          Built to help the community.{' '}
          <a href="https://github.com/saharmor/lite-llm-map" target="_blank" rel="noopener noreferrer" className="hover:text-clay transition-colors underline">
            Source on GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
