import { ATTACK_DATE, COMPROMISED_VERSIONS } from '../lib/constants';

export default function Hero() {
  return (
    <header className="pt-12 sm:pt-16 pb-4 text-center">
      <div className="max-w-2xl mx-auto px-4">
        <p className="text-text-secondary text-sm tracking-widest uppercase mb-4">
          Supply Chain Attack &middot; {ATTACK_DATE}
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4 leading-tight">
          Was your project affected?
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed">
          LiteLLM versions{' '}
          <code className="bg-surface-raised px-1.5 py-0.5 rounded text-danger font-semibold text-base">{COMPROMISED_VERSIONS[0]}</code>
          {' '}and{' '}
          <code className="bg-surface-raised px-1.5 py-0.5 rounded text-danger font-semibold text-base">{COMPROMISED_VERSIONS[1]}</code>
          {' '}on PyPI contained credential-stealing malware.
        </p>
      </div>
    </header>
  );
}
