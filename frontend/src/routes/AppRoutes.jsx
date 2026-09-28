import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import OrganizerLayout from '../layouts/OrganizerLayout';
import { useAuth } from '../context/AuthContext';

// Public & Main Pages
import Hackathons from '../pages/Hackathons';
import HackathonDetails from '../pages/HackathonDetails';
import HackathonRegister from '../pages/HackathonRegister';
import Login from '../pages/Login';
import Register from '../pages/Register';

// User / Participant Dashboard Pages
import Dashboard from '../pages/Dashboard';
import MyHackathons from '../pages/MyHackathons';
import Teams from '../pages/Teams';
import TeamDetails from '../pages/TeamDetails';
import Submissions from '../pages/Submissions';
import CreateSubmission from '../pages/CreateSubmission';
import Profile from '../pages/Profile';
import Notifications from '../pages/Notifications';

// Admin / Organizer Console Pages
import AdminDashboard from '../pages/AdminDashboard';
import AdminManageHackathons from '../pages/AdminManageHackathons';
import CreateHackathon from '../pages/CreateHackathon';
import AdminEditHackathon from '../pages/AdminEditHackathon';
import AdminEventRegistrations from '../pages/AdminEventRegistrations';
import AdminAllRegistrations from '../pages/AdminAllRegistrations';
import AdminParticipants from '../pages/AdminParticipants';

import ProtectedRoute from '../components/ProtectedRoute';
import NotFound from '../pages/NotFound';

function RootRedirect() {
  const { user, isAuthenticated, isOrganizer, isAdmin } = useAuth();
  if (isAuthenticated && user) {
    const userRole = (user.role || '').toUpperCase();
    if (userRole === 'ADMIN' || userRole === 'ORGANIZER' || isOrganizer || isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root & Public Main Layout */}
      <Route path="/" element={<MainLayout />}>
        {/* / redirects to /admin or /dashboard if authenticated, or /login if not authenticated */}
        <Route index element={<RootRedirect />} />

        {/* Explore Hackathons & Event Details */}
        <Route path="hackathons" element={<Hackathons />} />
        <Route path="hackathons/:id" element={<HackathonDetails />} />
        <Route
          path="hackathons/:id/register"
          element={
            <ProtectedRoute>
              <HackathonRegister />
            </ProtectedRoute>
          }
        />

        {/* Alias routes for /events */}
        <Route path="events" element={<Hackathons />} />
        <Route path="events/:id" element={<HackathonDetails />} />
        <Route
          path="events/:id/register"
          element={
            <ProtectedRoute>
              <HackathonRegister />
            </ProtectedRoute>
          }
        />

        {/* Auth Pages */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* User / Participant Dashboard Routes (Requirement 7) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="participant">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="hackathons" element={<MyHackathons />} />
        <Route path="teams" element={<Teams />} />
        <Route path="teams/:id" element={<TeamDetails />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="submissions/new" element={<CreateSubmission />} />
        <Route path="submissions/edit/:id" element={<CreateSubmission />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Alias /user/dashboard -> /dashboard */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRole="participant">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="hackathons" element={<MyHackathons />} />
        <Route path="teams" element={<Teams />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin Console Routes (Requirement 2) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <OrganizerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="hackathons" element={<AdminManageHackathons />} />
        <Route path="hackathons/create" element={<CreateHackathon />} />
        <Route path="hackathons/edit/:id" element={<AdminEditHackathon />} />
        <Route path="hackathons/:id/edit" element={<AdminEditHackathon />} />
        <Route path="create-hackathon" element={<CreateHackathon />} />
        <Route path="edit-hackathon/:id" element={<AdminEditHackathon />} />
        <Route path="hackathons/:id/registrations" element={<AdminEventRegistrations />} />
        <Route path="registrations" element={<AdminAllRegistrations />} />
        <Route path="participants" element={<AdminParticipants />} />
        <Route path="teams" element={<Teams />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Organizer Console Alias Routes */}
      <Route
        path="/organizer"
        element={
          <ProtectedRoute allowedRole="admin">
            <OrganizerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="hackathons" element={<AdminManageHackathons />} />
        <Route path="hackathons/create" element={<CreateHackathon />} />
        <Route path="hackathons/edit/:id" element={<AdminEditHackathon />} />
        <Route path="hackathons/:id/edit" element={<AdminEditHackathon />} />
        <Route path="create-hackathon" element={<CreateHackathon />} />
        <Route path="edit-hackathon/:id" element={<AdminEditHackathon />} />
        <Route path="hackathons/:id/registrations" element={<AdminEventRegistrations />} />
        <Route path="registrations" element={<AdminAllRegistrations />} />
        <Route path="participants" element={<AdminParticipants />} />
        <Route path="teams" element={<Teams />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
