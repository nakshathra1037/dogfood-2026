import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Search, ExternalLink, Code2, Users, Sparkles, Trophy } from 'lucide-react';

export function GalleryPage() {
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [search, selectedEvent]);

  const fetchEvents = async () => {
    try {
      const res = await apiClient.get('/events?limit=50');
      setEvents(res.data.items || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedEvent) params.append('event_id', selectedEvent);
      params.append('limit', '50');

      const res = await apiClient.get(`/gallery?${params.toString()}`);
      setProjects(res.data.items || []);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HACKATHON SHOWCASE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Discover Submitted Projects
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400">
          Browse innovative applications, decentralized tools, and AI prototypes built by competing teams across all hackathon tracks.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Hackathon Events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <LoadingSpinner message="Loading gallery projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No submitted projects found"
          description="Projects will appear here once teams complete and submit their hackathon entries."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => setSelectedProject(proj)}
              className="group cursor-pointer flex flex-col justify-between rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 hover:border-indigo-500/50 hover:bg-slate-900 transition shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  {proj.track ? (
                    <Badge variant="primary">{proj.track.name}</Badge>
                  ) : (
                    <Badge variant="default">General Track</Badge>
                  )}
                  <Badge variant="success">SUBMITTED</Badge>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition line-clamp-1">
                  {proj.name}
                </h3>
                <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-medium text-slate-300">
                    {proj.team?.name || 'Independent Team'}
                  </span>
                </div>

                <span className="text-indigo-400 font-semibold group-hover:underline">
                  View Details &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      <Modal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.name || 'Project Details'}
        maxWidth="max-w-2xl"
      >
        {selectedProject && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {selectedProject.track && (
                <Badge variant="primary">{selectedProject.track.name}</Badge>
              )}
              <Badge variant="success">Official Submission</Badge>
              {selectedProject.team && (
                <Badge variant="info">Team: {selectedProject.team.name}</Badge>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Project Overview
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {selectedProject.description || 'No description provided.'}
              </p>
            </div>

            {/* Team Members */}
            {selectedProject.team?.members?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Builders ({selectedProject.team.members.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team.members.map((m) => (
                    <div
                      key={m.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                    >
                      {m.user?.name || `User #${m.user_id}`}{' '}
                      <span className="text-slate-500">({m.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
              {selectedProject.repository_url && (
                <a
                  href={selectedProject.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Source Repository</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {selectedProject.demo_url && (
                <a
                  href={selectedProject.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Demo Preview</span>
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
