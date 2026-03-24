import { useState } from 'react';
import { KNOWN_AFFECTED_PROJECTS } from '../lib/types';

export default function AffectedProjects() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? KNOWN_AFFECTED_PROJECTS : KNOWN_AFFECTED_PROJECTS.slice(0, 6);

  return (
    <section className="py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-text-primary mb-1">Known affected projects</h2>
        <p className="text-text-tertiary text-sm mb-4">
          Not exhaustive, any project depending on litellm may be affected.
        </p>

        <div className="grid sm:grid-cols-2 gap-2">
          {visible.map((p) => (
            <a
              key={p.name}
              href={p.issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-white/60 border border-border rounded-lg px-3 py-2.5 hover:border-clay/30 transition-colors group"
            >
              <div className="min-w-0">
                <span className="font-mono text-sm text-text-primary group-hover:text-clay transition-colors truncate block">{p.name}</span>
                <span className="text-xs text-text-tertiary">{p.description}</span>
              </div>
              <svg className="w-4 h-4 text-text-tertiary group-hover:text-clay flex-none ml-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>

        {KNOWN_AFFECTED_PROJECTS.length > 6 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-sm text-clay hover:text-clay-hover transition-colors cursor-pointer"
          >
            {expanded ? 'Show fewer' : `Show all ${KNOWN_AFFECTED_PROJECTS.length} projects`}
          </button>
        )}
      </div>
    </section>
  );
}
