import { useAuth } from '../context/AuthContext';
import { FiGlobe } from 'react-icons/fi';

export default function Navbar({ title }) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between px-8 sticky top-0 z-40">
      <h2 className="text-lg font-bold font-outfit text-white tracking-wide">{title}</h2>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] font-semibold">
          <FiGlobe className="text-[var(--color-accent)]" />
          <span>System: {user?.preferredUnitSystem || 'METRIC'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-secondary)]">Hello, <strong className="text-[var(--color-text-primary)]">{user?.username}</strong></span>
        </div>
      </div>
    </header>
  );
}
