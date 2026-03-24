import { KNOWN_AFFECTED_PROJECTS } from '../lib/types';

export default function AffectedProjects() {
  return (
    <section className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Known affected downstream projects</h2>
        <p className="text-gray-600 mb-6 text-sm">
          These projects have filed issues related to the LiteLLM compromise. This is not exhaustive — any project
          that depends on litellm may be affected.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          {KNOWN_AFFECTED_PROJECTS.map((project) => (
            <a
              key={project.name}
              href={project.issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-sm transition-all group"
            >
              <div className="font-mono text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                {project.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">{project.description}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
