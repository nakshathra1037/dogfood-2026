import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  Users,
  Layers,
  Sparkles,
  Send,
  Save,
  CheckCircle2,
  Copy,
  ExternalLink,
  AlertCircle,
  LogOut,
  Plus,
} from 'lucide-react';

export function ParticipantDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [teams, setTeams] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectTrackId, setProjectTrackId] = useState('');
  const [projectRepo, setProjectRepo] = useState('');
  const [projectDemo, setProjectDemo] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchActiveEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEventAndTeamData(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchActiveEvents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/events?limit=50');
      const allEvents = res.data.items || [];
      setEvents(allEvents);
      if (allEvents.length > 0) {
        setSelectedEventId(String(allEvents[0].id));
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const loadEventAndTeamData = async (eventId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // 1. Load Event Detail
      const evRes = await apiClient.get(`/events/${eventId}`);
      setSelectedEvent(evRes.data);

      // 2. Load Teams for this event
      const teamsRes = await apiClient.get(`/events/${eventId}/teams`);
      const eventTeams = teamsRes.data.items || [];
      setTeams(eventTeams);

      // Find my team
      const foundTeam = eventTeams.find((t) =>
        t.members?.some((m) => m.user_id === user?.id)
      );

      if (foundTeam) {
        // Fetch full team detail
        const fullTeamRes = await apiClient.get(`/teams/${foundTeam.id}`);
        setMyTeam(fullTeamRes.data);

        // Fetch project for this team if any
        if (fullTeamRes.data.project) {
          setProject(fullTeamRes.data.project);
          populateProjectForm(fullTeamRes.data.project);
        } else {
          // Attempt to find project by querying gallery or detail
          setProject(null);
        }
      } else {
        setMyTeam(null);
        setProject(null);
      }
    } catch (err) {
      setError(err.userMessage || 'Error loading dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const populateProjectForm = (p) => {
    setProjectName(p.name || '');
    setProjectDesc(p.description || '');
    setProjectTrackId(p.track_id ? String(p.track_id) : '');
    setProjectRepo(p.repository_url || '');
    setProjectDemo(p.demo_url || '');
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.post(`/events/${selectedEventId}/teams`, {
        name: newTeamName.trim(),
        max_size: 5,
      });
      setMyTeam(res.data);
      setNewTeamName('');
      setSuccess('Team created successfully!');
      loadEventAndTeamData(selectedEventId);
    } catch (err) {
      setError(err.userMessage || 'Failed to create team.');
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.post('/teams/join', {
        invite_code: inviteCodeInput.trim(),
      });
      setMyTeam(res.data);
      setInviteCodeInput('');
      setSuccess('Successfully joined team!');
      loadEventAndTeamData(selectedEventId);
    } catch (err) {
      setError(err.userMessage || 'Failed to join team.');
    }
  };

  const handleLeaveTeam = async () => {
    if (!myTeam || !window.confirm('Are you sure you want to leave this team?')) return;
    try {
      await apiClient.post(`/teams/${myTeam.id}/leave`);
      setMyTeam(null);
      setProject(null);
      setSuccess('You left the team.');
      loadEventAndTeamData(selectedEventId);
    } catch (err) {
      setError(err.userMessage || 'Failed to leave team.');
    }
  };

  const handleSaveProjectDraft = async (e) => {
    e.preventDefault();
    if (!myTeam) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: projectName.trim(),
        description: projectDesc.trim(),
        track_id: projectTrackId ? parseInt(projectTrackId, 10) : null,
        repository_url: projectRepo.trim() || null,
        demo_url: projectDemo.trim() || null,
      };

      let res;
      if (!project) {
        // Create
        res = await apiClient.post(`/teams/${myTeam.id}/projects`, payload);
      } else {
        // Update
        res = await apiClient.patch(`/projects/${project.id}`, payload);
      }

      setProject(res.data);
      setSuccess('Project draft saved successfully!');
    } catch (err) {
      setError(err.userMessage || 'Failed to save project draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitProject = async () => {
    if (!project) return;
    if (!window.confirm('Are you sure you want to submit? Submitted projects cannot be edited without organizer approval.')) return;

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.post(`/projects/${project.id}/submit`);
      setProject(res.data);
      setSuccess('🎉 Congratulations! Your project has been officially submitted and is now featured in the Public Gallery!');
    } catch (err) {
      setError(err.userMessage || 'Failed to submit project.');
    } finally {
      setSaving(false);
    }
  };

  const copyInviteCode = () => {
    if (myTeam?.invite_code) {
      navigator.clipboard.writeText(myTeam.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Participant Builder Hub
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your hackathon team, collaborate with builders, and submit your project.
          </p>
        </div>

        {/* Event Selector */}
        {events.length > 0 && (
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-400">Current Event:</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading your team and project..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Team Status */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-800">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Your Team</h2>
              </div>

              {!myTeam ? (
                <div className="space-y-5">
                  <p className="text-xs text-slate-400">
                    You are not currently in a team for this hackathon. Create a new team or join one using an invite code.
                  </p>

                  {/* Create Team Form */}
                  <form onSubmit={handleCreateTeam} className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">Create New Team</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        required
                        placeholder="Team Name (e.g. Alpha Wizards)"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                      >
                        Create
                      </button>
                    </div>
                  </form>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase">OR</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  {/* Join Team Form */}
                  <form onSubmit={handleJoinTeam} className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">Join with Invite Code</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        required
                        placeholder="Invite Code (e.g. ALPHA2026)"
                        value={inviteCodeInput}
                        onChange={(e) => setInviteCodeInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
                      >
                        Join
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Team Name</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{myTeam.name}</h3>
                  </div>

                  {/* Invite Code box */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Invite Code</span>
                        <div className="font-mono text-sm font-extrabold text-indigo-400 mt-0.5">
                          {myTeam.invite_code}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={copyInviteCode}
                        className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1 transition"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Member List */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                      Members ({myTeam.members?.length || 0} / {myTeam.max_size})
                    </span>
                    <div className="space-y-2">
                      {myTeam.members?.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
                        >
                          <span className="font-medium text-slate-200">
                            {m.user?.name || `User #${m.user_id}`} {m.user_id === user?.id && '(You)'}
                          </span>
                          <Badge variant={m.role === 'LEADER' ? 'primary' : 'default'}>
                            {m.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleLeaveTeam}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Leave Team</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Project Workspace */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-bold text-white">Hackathon Project Submission</h2>
                </div>

                {project && (
                  <Badge variant={project.status === 'SUBMITTED' ? 'success' : 'warning'}>
                    Status: {project.status}
                  </Badge>
                )}
              </div>

              {!myTeam ? (
                <EmptyState
                  title="Team Required"
                  description="You must create or join a team before creating and editing a project submission."
                />
              ) : (
                <form onSubmit={handleSaveProjectDraft} className="space-y-5">
                  {project?.status === 'SUBMITTED' && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Project Officially Submitted!</strong>
                        <p className="mt-0.5 text-slate-300">
                          Your project was submitted at{' '}
                          {new Date(project.submitted_at).toLocaleString()} and is now publicly visible in the showcase gallery and available for judge review.
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={project?.status === 'SUBMITTED'}
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. NeuroVision AI Assistant"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Select Competition Track
                    </label>
                    <select
                      value={projectTrackId}
                      disabled={project?.status === 'SUBMITTED'}
                      onChange={(e) => setProjectTrackId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">General Track (No specific track)</option>
                      {selectedEvent?.tracks?.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Project Overview & Description *
                    </label>
                    <textarea
                      rows={5}
                      required
                      disabled={project?.status === 'SUBMITTED'}
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      placeholder="Describe the problem, your technical architecture, innovations, and impact..."
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Source Repository URL (GitHub, GitLab)
                      </label>
                      <input
                        type="url"
                        disabled={project?.status === 'SUBMITTED'}
                        value={projectRepo}
                        onChange={(e) => setProjectRepo(e.target.value)}
                        placeholder="https://github.com/org/repo"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Live Demo Preview URL
                      </label>
                      <input
                        type="url"
                        disabled={project?.status === 'SUBMITTED'}
                        value={projectDemo}
                        onChange={(e) => setProjectDemo(e.target.value)}
                        placeholder="https://my-demo-app.com"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Submission actions */}
                  {project?.status !== 'SUBMITTED' && (
                    <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition shadow"
                      >
                        <Save className="w-4 h-4 text-indigo-400" />
                        <span>Save Draft</span>
                      </button>

                      {project && (
                        <button
                          type="button"
                          onClick={handleSubmitProject}
                          disabled={saving}
                          className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20"
                        >
                          <Send className="w-4 h-4" />
                          <span>Submit Project to Hackathon</span>
                        </button>
                      )}
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
