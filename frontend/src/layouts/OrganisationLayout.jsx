import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiBarChart2,
  FiBriefcase,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import MotionBackdrop from "../components/MotionBackdrop";
import EcoPulse from "../components/EcoPulse";
import ThemeToggle from "../components/ThemeToggle";

const groups = [
  [
    "Workspace",
    [
      ["/organisation/dashboard", "Overview", FiGrid],
      ["/organisation/activity", "Activity logging", FiActivity],
      ["/organisation/people", "People & teams", FiUsers],
    ],
  ],
  [
    "Intelligence",
    [
      ["/organisation/analytics", "Analytics", FiBarChart2],
      ["/organisation/reports", "CSR reports", FiFileText],
    ],
  ],
];

export default function OrganisationLayout() {
  const { user, logout } = useAuth();
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

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden w-64 border-r p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 md:block ${
          dark
          ? "border-[#22324d] bg-gradient-to-b from-[#07111f] via-[#091321] to-[#06111b]"
          : "border-[#dbe8ff] bg-gradient-to-b from-white via-[#fafcff] to-[#f3f8ff]"
        }`}
      >
        <div className="mb-9 flex items-center gap-2 px-3 pt-2">
          <span className="rounded-lg bg-emerald-400 p-2 text-slate-950">
            <FiBriefcase />
          </span>

          <div>
            <p className="font-bold">CarbonTrack</p>
            <p className="text-[10px] uppercase tracking-wider text-emerald-500">
              Organisation
            </p>
          </div>
        </div>

        {groups.map(([title, items]) => (
          <section key={title} className="mb-7">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-emerald-500">
              {title}
            </p>

            {items.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold no-underline transition-all duration-300 ${
                   isActive
                     ? "bg-gradient-to-r from-[#2563eb] to-[#4f8cff] text-white shadow-lg shadow-blue-500/30"
                     : dark
                     ? "text-slate-200 hover:bg-slate-800 hover:text-white"
                     : "text-slate-700 hover:bg-slate-200 hover:text-black"
                      ? "text-slate-200 hover:bg-slate-800 hover:text-white"
                      : "text-slate-700 hover:bg-slate-200 hover:text-black"
                  }`
                }
              >
                <Icon />
                {label}
              </NavLink>
            ))}
          </section>
        ))}

        <div
          className={`absolute inset-x-4 bottom-5 border-t pt-4 ${
            dark ? "border-slate-700" : "border-slate-300"
          }`}
        >
          <p
            className={`mb-3 truncate px-3 text-xs ${
              dark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {user?.email}
          </p>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
              dark
                ? "text-slate-200 hover:bg-slate-800"
                : "text-slate-700 hover:bg-slate-200"
            }`}
          >
            <FiLogOut />
            Sign out
          </button>
        </div>
      </aside>

      {/* Header */}
      <header
        className={`sticky top-0 z-20 flex items-center justify-between border-b px-5 py-4 backdrop-blur-xl transition-all duration-300 md:ml-64 md:px-9 ${
          dark
          ? "border-[#23344f] bg-[#091120]/90"
          : "border-[#dbe8ff] bg-white/90"
        }`}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-emerald-500">
            Corporate Sustainability Workspace
          </p>

          <p
            className={`mt-0.5 text-sm ${
              dark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Measure. Mobilise. Report.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <EcoPulse className="h-10 w-10" />

          <NavLink
            to="/organisation/activity"
            className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 no-underline transition hover:bg-emerald-300"
          >
            Log activity
          </NavLink>
        </div>
      </header>

      {/* Main */}
      <main
        className={`relative z-10 min-h-[calc(100vh-73px)] p-5 backdrop-blur-sm transition-all duration-300 md:ml-64 md:p-9 ${
          dark ? "bg-slate-950/80" : "bg-slate-100"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}