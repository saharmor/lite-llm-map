import Hero from './components/Hero';
import RepoChecker from './components/RepoChecker';
import WhatHappened from './components/WhatHappened';
import AffectedVersions from './components/AffectedVersions';
import AffectedProjects from './components/AffectedProjects';
import Remediation from './components/Remediation';
import Sources from './components/Sources';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <Hero />
      <RepoChecker />
      <WhatHappened />
      <AffectedVersions />
      <AffectedProjects />
      <Remediation />
      <Sources />
    </div>
  );
}
