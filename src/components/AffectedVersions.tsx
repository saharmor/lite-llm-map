export default function AffectedVersions() {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Affected versions</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border-2 border-red-300 bg-red-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">MALICIOUS</span>
              <span className="font-mono text-lg font-bold text-red-800">v1.82.7</span>
            </div>
            <ul className="space-y-2 text-sm text-red-900">
              <li className="flex gap-2">
                <span className="text-red-500 flex-none">&#x2022;</span>
                <span>Payload in <code className="bg-red-100 px-1 rounded text-xs">proxy_server.py</code></span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 flex-none">&#x2022;</span>
                <span>Triggers on <code className="bg-red-100 px-1 rounded text-xs">import litellm.proxy</code></span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 flex-none">&#x2022;</span>
                <span>Steals credentials + deploys Kubernetes backdoor</span>
              </li>
            </ul>
          </div>

          <div className="border-2 border-red-500 bg-red-50 rounded-xl p-6 ring-2 ring-red-300">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-red-700 text-white text-xs font-bold px-2 py-1 rounded">MOST DANGEROUS</span>
              <span className="font-mono text-lg font-bold text-red-800">v1.82.8</span>
            </div>
            <ul className="space-y-2 text-sm text-red-900">
              <li className="flex gap-2">
                <span className="text-red-500 flex-none">&#x2022;</span>
                <span>Added <code className="bg-red-100 px-1 rounded text-xs">litellm_init.pth</code> file</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 flex-none">&#x2022;</span>
                <span><strong>Runs on ANY Python startup</strong> — no import needed</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 flex-none">&#x2022;</span>
                <span>Everything from v1.82.7 + persistent backdoor via systemd</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 bg-green-50 border border-green-300 rounded-xl p-4 text-center">
          <span className="text-green-800 font-medium">
            Last confirmed safe version: <span className="font-mono font-bold">v1.82.6</span>
          </span>
          <span className="mx-2 text-green-400">|</span>
          <span className="text-green-700 text-sm">Docker image users were not impacted (dependencies were pinned)</span>
        </div>
      </div>
    </section>
  );
}
