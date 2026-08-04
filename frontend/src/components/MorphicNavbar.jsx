import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "react-i18next";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { profileService } from '../services/api';
import { toast } from 'react-toastify';
import { 
  FiHome, 
  FiCompass, 
  FiPlusCircle, 
  FiTarget, 
  FiAward, 
  FiShield, 
  FiGlobe, 
  FiSun, 
  FiMoon, 
  FiLogOut 
} from 'react-icons/fi';
import { RiMedalLine } from 'react-icons/ri';

export default function MorphicNavbar({ title }) {
  const { user, updateUser, logout, isOrgAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const isDark = theme === 'dark';

  const navItems = [
    { path: "/dashboard", name: t("dashboard"), icon: FiHome },
    { path: "/route-optimizer", name: t("routePlanner"), icon: FiCompass },
    { path: "/log-activity", name: t("logActivity"), icon: FiPlusCircle },
    { path: "/goals", name: t("goals"), icon: FiTarget },
    { path: "/leaderboard", name: t("leaderboard"), icon: FiAward },
    { path: "/badges", name: t("badges"), icon: RiMedalLine },
    ...(isOrgAdmin
      ? [{ path: "/organisation/dashboard", name: t("orgAdmin"), icon: FiShield }]
      : []),
  ];

  const handleUnitSystemChange = async (e) => {
    const newSystem = e.target.value;
    try {
      const updated = await profileService.updateProfile({
        preferredUnitSystem: newSystem
      });
      updateUser(updated);
      toast.success(`Unit system updated to ${newSystem.toLowerCase()}!`);
    } catch (err) {
      toast.error('Failed to update preferred unit system');
    }
  };

  const isActiveLink = (path) => {
    return location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-300 bg-[var(--color-bg-secondary)]/85 border-[var(--color-border)]/60 text-[var(--color-text-primary)] shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Left Far: Brand Logo & Title */}
            <div 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 cursor-pointer shrink-0"
            >
              <svg viewBox="0 0 100 100" className="w-8 h-8 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 50,14 A 36,36 0 1,1 30,22" stroke="var(--color-text-primary)" strokeWidth="7" strokeLinecap="round" />
                <path d="M 41,6 L 54,14 L 41,22 Z" fill="var(--color-accent)" />
                <path d="M 28,34 C 20,48 24,66 38,74 C 30,64 28,50 34,36 C 35,34 32,32 28,34 Z" fill="var(--color-accent-blue)" opacity="0.8" />
                <path d="M 37,42 C 31,54 33,68 44,74 C 38,66 36,54 41,43 C 42,41 39,40 37,42 Z" fill="var(--color-accent-blue)" opacity="0.9" />
                <path d="M 49,75 C 44,60 47,44 57,36 C 58,48 56,62 49,75 Z" fill="var(--color-accent-light)" />
                <path d="M 49,75 C 56,62 58,48 57,36 C 68,40 73,53 69,67 C 66,73 58,76 49,75 Z" fill="var(--color-bg-card)" />
                <path d="M 49,75 C 53,62 55,48 57,36" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="font-outfit font-extrabold text-xl tracking-tight hidden sm:inline-block text-[var(--color-text-primary)]">
                CarbonTrack
              </span>
            </div>

            {/* Center: Morphic Navbar Pills Container with Framer Motion LayoutGroup Morphing */}
            <nav className="flex-1 flex justify-center px-4 max-w-4xl">
              <LayoutGroup id="morphic-navbar">
                <div className={`relative flex items-center p-1 rounded-2xl border transition-colors duration-200 overflow-x-auto scrollbar-none ${
                  isDark 
                    ? 'bg-slate-900/90 border-slate-700/70 shadow-inner' 
                    : 'bg-slate-100/90 border-slate-200/80 shadow-inner'
                }`}>
                  {navItems.map((item) => {
                    const isActive = isActiveLink(item.path);
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={`relative flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors duration-150 ${
                          isActive
                            ? 'text-white'
                            : isDark
                            ? 'text-slate-300 hover:text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {/* Morphing Active Pill Background */}
                        {isActive && (
                          <motion.div
                            layoutId="morphic-active-pill"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/25 transform-gpu pointer-events-none"
                            transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.5 }}
                          />
                        )}

                        {/* Link Content */}
                        <span className="relative z-10 flex items-center gap-1.5">
                          <Icon className={`text-sm ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="hidden md:inline">{item.name}</span>
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              </LayoutGroup>
            </nav>

            {/* Right Most: Unit Selector, Theme Toggle, Profile & Logout */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
              
              {/* Unit System Dropdown */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] font-semibold shadow-sm">
                <FiGlobe className="text-[var(--color-accent-blue)]" />
                <select
                  value={user?.preferredUnitSystem || 'METRIC'}
                  onChange={handleUnitSystemChange}
                  className="bg-transparent border-none outline-none font-bold text-[var(--color-text-primary)] cursor-pointer text-xs"
                >
                  <option value="METRIC" className="bg-[var(--color-bg-card)] text-[var(--color-text-primary)]">METRIC</option>
                  <option value="IMPERIAL" className="bg-[var(--color-bg-card)] text-[var(--color-text-primary)]">IMPERIAL</option>
                </select>
              </div>

              {/* Language Selector */}
              <LanguageSelector />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                className="w-9 h-9 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)] flex items-center justify-center transition duration-300 cursor-pointer shadow-sm"
              >
                {theme === 'light' ? (
                  <FiMoon className="text-base text-[var(--color-text-primary)]" />
                ) : (
                  <FiSun className="text-base text-yellow-400" />
                )}
              </button>

              {/* Profile Avatar Capsule */}
              <div 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 pl-1.5 py-1 pr-3 hover:bg-[var(--color-bg-card-hover)] border border-[var(--color-border)] rounded-full cursor-pointer transition duration-200 shadow-sm"
                title="View Profile"
              >
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.username} className="w-7 h-7 rounded-full object-cover border border-[var(--color-border)]/50" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)]/50 flex items-center justify-center font-bold text-[var(--color-accent)] text-[10px] uppercase">
                    {user?.username?.substring(0, 2)}
                  </div>
                )}
                <span className="text-xs font-bold text-[var(--color-text-secondary)] hidden sm:inline">{user?.username}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => setShowConfirmLogout(true)}
                title="Log Out"
                className="w-9 h-9 rounded-full border border-[var(--color-border)] hover:border-red-500/40 bg-[var(--color-bg-card)] hover:bg-red-500/10 text-slate-400 hover:text-red-500 flex items-center justify-center transition cursor-pointer shadow-sm"
              >
                <FiLogOut className="text-base" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Confirm Logout Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 flex flex-col items-center bg-[var(--color-bg-secondary)] border-[var(--color-border)] shadow-2xl animate-fade-in text-[var(--color-text-primary)]">
            <h4 className="text-base font-bold mb-2 font-outfit"> {t("confirmLogout")}</h4>
            <p className="text-xs text-[var(--color-text-secondary)] text-center mb-6 leading-relaxed">
              {t("confirmLogoutMessage")}
            </p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowConfirmLogout(false)}
                className="flex-1 btn-ghost py-2 text-xs font-semibold rounded-xl cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmLogout(false);
                  logout();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border-none shadow-md shadow-red-900/30"
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
