import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { GalleryPage } from './pages/GalleryPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ParticipantDashboard } from './pages/ParticipantDashboard';
import { JudgeDashboard } from './pages/JudgeDashboard';
import { OrganizerDashboard } from './pages/OrganizerDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<GalleryPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/participant" element={<ParticipantDashboard />} />
              <Route path="/judge" element={<JudgeDashboard />} />
              <Route path="/organizer" element={<OrganizerDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
            DOGFOOD 2026 &mdash; Open-Source Hackathon Submission and Judging Platform
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
