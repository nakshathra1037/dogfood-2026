import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import OrganizerLayout from '../layouts/OrganizerLayout';

// Public Pages
import Home from '../pages/Home';
import Hackathons from '../pages/Hackathons';
import HackathonDetails from '../pages/HackathonDetails';
import Login from '../pages/Login';
import Register from '../pages/Register';

// User Dashboard Pages
import Dashboard from '../pages/Dashboard';
import MyHackathons from '../pages/MyHackathons';
import Teams from '../pages/Teams';
import TeamDetails from '../pages/TeamDetails';
import Submissions from '../pages/Submissions';
import CreateSubmission from '../pages/CreateSubmission';
import Profile from '../pages/Profile';
import Notifications from '../pages/Notifications';

// Organizer Pages
import OrganizerDashboard from '../pages/OrganizerDashboard';
import CreateHackathon from '../pages/CreateHackathon';
import ManageHackathons from '../pages/ManageHackathons';
import ManageParticipants from '../pages/ManageParticipants';
import ManageSubmissions from '../pages/ManageSubmissions';
import Evaluations from '../pages/Evaluations';
import Analytics from '../pages/Analytics';

import ProtectedRoute from '../components/ProtectedRoute';
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="hackathons" element={<Hackathons />} />
        <Route path="hackathons/:id" element={<HackathonDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* User Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
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

      {/* Organizer Console Routes */}
      <Route
        path="/organizer"
        element={
          <ProtectedRoute allowedRole="organizer">
            <OrganizerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OrganizerDashboard />} />
        <Route path="create-hackathon" element={<CreateHackathon />} />
        <Route path="hackathons" element={<ManageHackathons />} />
        <Route path="participants" element={<ManageParticipants />} />
        <Route path="submissions" element={<ManageSubmissions />} />
        <Route path="evaluations" element={<Evaluations />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}
