import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiActivity, FiBarChart2, FiBriefcase, FiFileText, FiGrid, FiLogOut, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import MotionBackdrop from '../components/MotionBackdrop';
import EcoPulse from '../components/EcoPulse';

const workspaces = [
  ['/organisation/dashboard', 'Overview', FiGrid],
  ['/organisation/activity', 'Activity logging', FiActivity],
  ['/organisation/people', 'People & teams', FiUsers],
];
const insights = [
  ['/organisation/analytics', 'Analytics', FiBarChart2],
  ['/organisation/reports', 'CSR reports', FiFileText],
];

export default function OrganisationLayout() {
  const { user, logout } = useAuth(); const navigate = useNavigate();
  const links = (title, items) => <section className="mb-7"><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-emerald-300/55">{title}</p>{items.map(([to, label, Icon]) => <NavLink key={to} to={to} className={({isActive}) => `mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold no-underline transition ${isActive ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Icon />{label}</NavLink>)}</section>;
  return <div className="relative isolate min-h-screen bg-slate-950 text-slate-100"><MotionBackdrop /><aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-emerald-400/10 bg-slate-950/85 p-4 backdrop-blur-xl md:block"><div className="mb-9 flex items-center gap-2 px-3 pt-2"><span className="rounded-lg bg-emerald-400 p-2 text-slate-950"><FiBriefcase /></span><div><p className="font-bold">CarbonTrack</p><p className="text-[10px] uppercase tracking-wider text-emerald-300">Organisation</p></div></div>{links('Workspace', workspaces)}{links('Intelligence', insights)}<div className="absolute inset-x-4 bottom-5 border-t border-slate-800 pt-4"><p className="mb-3 truncate px-3 text-xs text-slate-400">{user?.email}</p><button onClick={() => {logout(); navigate('/');}} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"><FiLogOut /> Sign out</button></div></aside><header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-5 py-4 backdrop-blur-xl md:ml-64 md:px-9"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-emerald-400">Corporate sustainability workspace</p><p className="mt-0.5 text-sm text-slate-400">Measure. Mobilise. Report.</p></div><div className="flex items-center gap-3"><EcoPulse className="h-10 w-10"/><NavLink to="/organisation/activity" className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950 no-underline hover:bg-emerald-300">Log activity</NavLink></div></header><main className="relative z-10 p-5 md:ml-64 md:p-9"><Outlet /></main></div>;
}
