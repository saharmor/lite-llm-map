const SOURCES = [
  { title: 'Original security report (#24512)', url: 'https://github.com/BerriAI/litellm/issues/24512' },
  { title: 'LiteLLM team response (#24518)', url: 'https://github.com/BerriAI/litellm/issues/24518' },
  { title: 'PyPA Advisory - PYSEC-2026-2', url: 'https://github.com/pypa/advisory-database/blob/main/vulns/litellm/PYSEC-2026-2.yaml' },
  { title: 'The Register coverage', url: 'https://www.theregister.com/2026/03/24/trivy_compromise_litellm/' },
  { title: 'Hacker News discussion', url: 'https://news.ycombinator.com/item?id=47501729' },
  { title: 'Trivy attack writeup - Rami McCarthy', url: 'https://ramimac.me/trivy-teampcp/' },
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
        <div className="mt-8 pt-6 border-t border-border/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-text-tertiary">
          <p>
            Built by{' '}
            <a href="https://saharmor.me" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-text-secondary transition-colors">
              Sahar Mor
            </a>
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="https://github.com/saharmor/lite-llm-map" target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary transition-colors">
              Source on GitHub
            </a>
            <a href="https://promptclaude.dev" target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary transition-colors">
              Prompt Claude
            </a>
            <a href="https://toolsuse.dev" target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary transition-colors">
              Tool Calls Schema Generator
            </a>
            <a href="https://sidekickdev.com" target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary transition-colors">
              Sidekick Dev
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
