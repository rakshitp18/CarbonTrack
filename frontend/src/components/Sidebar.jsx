import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiPlusCircle, 
  FiTarget, 
  FiAward, 
  FiUser, 
  FiLogOut, 
  FiShield 
} from 'react-icons/fi';

export default function Sidebar() {
  const { user, logout, isOrgAdmin } = useAuth();

  return (
    <div className="w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold flex items-center gap-2 text-[var(--color-accent)] font-outfit">
          <span className="pulse-dot"></span>
          CarbonTrack
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Sustainability Analytics</p>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiHome className="text-lg" />
          Dashboard
        </NavLink>
        <NavLink to="/log-activity" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiPlusCircle className="text-lg" />
          Log Activity
        </NavLink>
        <NavLink to="/goals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiTarget className="text-lg" />
          Goals
        </NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiAward className="text-lg" />
          Leaderboard
        </NavLink>
        
        {isOrgAdmin && (
          <NavLink to="/organisation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FiShield className="text-lg" />
            Org Dashboard
          </NavLink>
        )}

        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiUser className="text-lg" />
          Profile
        </NavLink>
      </nav>

      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-accent)] text-sm uppercase">
            {user?.username?.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate">{user?.username}</h4>
            <p className="text-xs text-[var(--color-text-muted)] truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 btn-ghost text-red-400 hover:text-red-300 hover:bg-red-950/20 border-red-950/40 hover:border-red-500/30"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </div>
  );
}
