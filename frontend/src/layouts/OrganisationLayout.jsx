import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiBarChart2,
  FiFileText,
  FiGrid,
  FiUsers,
  FiArrowLeft
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import MotionBackdrop from "../components/MotionBackdrop";
import EcoPulse from "../components/EcoPulse";
import ThemeToggle from "../components/ThemeToggle";

const orgNavItems = [
  ["/organisation/dashboard", "Overview", FiGrid],
  ["/organisation/activity", "Log Activity", FiActivity],
  ["/organisation/people", "People & Teams", FiUsers],
  ["/organisation/analytics", "Analytics", FiBarChart2],
  ["/organisation/reports", "CSR Reports", FiFileText],
];

export default function OrganisationLayout() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const dark = theme === "dark";

  return (
    <div
      className={`relative isolate min-h-screen transition-all duration-300 ${
        dark
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-100 text-slate-900"
      }`}
    >
      <MotionBackdrop />

      {/* Top Header & Org Morphic Navbar */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-300 ${
          dark
            ? "border-[#23344f] bg-[#091120]/90"
            : "border-[#dbe8ff] bg-white/90"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Left Brand & Return to User App */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className={`p-2 rounded-xl border flex items-center justify-center transition cursor-pointer text-xs font-semibold ${
                  dark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-300 hover:bg-slate-200 text-slate-700"
                }`}
                title="Return to Main Dashboard"
              >
                <FiArrowLeft className="mr-1" /> User App
              </button>

              <div className="hidden sm:block">
                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 font-outfit">
                  Corporate Sustainability Workspace
                </p>
              </div>
            </div>

            {/* Org Morphic Navbar Pills */}
            <nav className="flex-1 max-w-2xl px-2">
              <div className="flex items-center justify-center">
                <div className={`flex items-center justify-between p-1 rounded-2xl border transition-all duration-300 overflow-x-auto scrollbar-none ${
                  dark 
                    ? 'bg-slate-900/90 border-slate-700/70 shadow-inner' 
                    : 'bg-slate-100/90 border-slate-200/80 shadow-inner'
                }`}>
                  {orgNavItems.map(([to, label, Icon]) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'mx-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 scale-[1.03]'
                            : `${
                                dark
                                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                              }`
                        }`
                      }
                    >
                      <Icon className="text-sm" />
                      <span className="hidden md:inline">{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </nav>

            {/* Right Tools */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <EcoPulse className="h-8 w-8 shrink-0" />
            </div>

          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 min-h-[calc(100vh-64px)] p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}