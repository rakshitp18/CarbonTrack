import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, OrgAdminRoute, GuestRoute } from './routes/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import Dashboard from './pages/Dashboard';
import LogActivity from './pages/LogActivity';
import Goals from './pages/Goals';
import Leaderboard from './pages/Leaderboard';
import Badges from "./pages/Badges";
import RouteOptimizer from './pages/RouteOptimizer';
import Organisation from './pages/Organisation';
import OrganisationAuth from './pages/OrganisationAuth';
import OrganisationPortal from './pages/OrganisationPortal';
import OrganisationLayout from './layouts/OrganisationLayout';
import OrganisationAnalytics from './pages/OrganisationAnalytics';
import OrganisationPeople from './pages/OrganisationPeople';
import OrganisationReports from './pages/OrganisationReports';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';

export default function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          {/* Guest Routes */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/organisation/login" element={<OrganisationAuth />} />
            <Route path="/organisation/register" element={<OrganisationAuth mode="register" />} />
          </Route>

          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout title="Dashboard" />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<DashboardLayout title="Route & Eco-Commute Planner" />}>
              <Route path="/route-optimizer" element={<RouteOptimizer />} />
            </Route>
            <Route element={<DashboardLayout title="Log Daily Activities" />}>
              <Route path="/log-activity" element={<LogActivity />} />
            </Route>
            <Route element={<DashboardLayout title="Carbon Goals & Milestones" />}>
              <Route path="/goals" element={<Goals />} />
            </Route>
            <Route element={<DashboardLayout title="Community Rankings" />}>
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>
            <Route element={<DashboardLayout title="Sustainability Badges" />}>
                <Route path="/badges" element={<Badges />} />
            </Route>
            <Route element={<DashboardLayout title="User Preferences" />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Org Admin Routes */}
          <Route element={<OrgAdminRoute />}>
            <Route element={<OrganisationLayout />}>
              <Route path="/organisation/dashboard" element={<OrganisationPortal />} />
              <Route path="/organisation/activity" element={<LogActivity />} />
              <Route path="/organisation/people" element={<OrganisationPeople />} />
              <Route path="/organisation/analytics" element={<OrganisationAnalytics />} />
              <Route path="/organisation/reports" element={<OrganisationReports />} />
            </Route>
            <Route element={<DashboardLayout title="Corporate CSR Dashboard" />}>
              <Route path="/organisation" element={<Organisation />} />
            </Route>
          </Route>

          {/* Fallbacks */}
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>

      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="light" 
      />
    </>
  );
}
