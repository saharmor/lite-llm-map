export default function Hero() {
  return (
    <div className="bg-red-700 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center">
        <div className="inline-block bg-red-900/50 text-red-100 text-sm font-mono px-3 py-1 rounded-full mb-6">
          SUPPLY CHAIN ATTACK &middot; MARCH 24, 2026
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          LiteLLM was compromised.
        </h1>
        <p className="text-lg sm:text-xl text-red-100 max-w-2xl mx-auto mb-2">
          Versions <span className="font-mono font-bold bg-red-900/40 px-1.5 py-0.5 rounded">1.82.7</span> and{' '}
          <span className="font-mono font-bold bg-red-900/40 px-1.5 py-0.5 rounded">1.82.8</span> on PyPI contained
          credential-stealing malware. 95M+ monthly downloads affected.
        </p>
        <p className="text-red-200 text-sm mt-4">
          Both versions have been yanked. Last safe version: <span className="font-mono font-bold">1.82.6</span>
        </p>
        <a
          href="#checker"
          className="inline-block mt-8 bg-white text-red-700 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-red-50 transition-colors"
        >
          Check if your project is affected &darr;
        </a>
      </div>
    </div>
  );
}
