import Hero from './components/Hero';
import RepoChecker from './components/RepoChecker';
import QuickFacts from './components/QuickFacts';
import AffectedProjects from './components/AffectedProjects';
import Remediation from './components/Remediation';
import Sources from './components/Sources';

export default function App() {
  return (
    <div className="min-h-screen">
      <Hero />
      <RepoChecker />
      <div className="border-t border-border" />
      <QuickFacts />
      <AffectedProjects />
      <Remediation />
      <Sources />
    </div>
  );
}
