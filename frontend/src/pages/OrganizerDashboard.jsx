import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  Trophy,
  Layers,
  Plus,
  Scale,
  Users,
  FileSpreadsheet,
  Download,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Medal,
} from 'lucide-react';

export function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventDetail, setEventDetail] = useState(null);
  const [rubrics, setRubrics] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [judges, setJudges] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [addTrackOpen, setAddTrackOpen] = useState(false);
  const [addPrizeOpen, setAddPrizeOpen] = useState(false);
  const [createRubricOpen, setCreateRubricOpen] = useState(false);
  const [assignJudgeOpen, setAssignJudgeOpen] = useState(false);

  // Form inputs
  const [eventName, setEventName] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [eventStatus, setEventStatus] = useState('ACTIVE');

  const [trackName, setTrackName] = useState('');
  const [trackDesc, setTrackDesc] = useState('');

  const [prizeName, setPrizeName] = useState('');
  const [prizeDesc, setPrizeDesc] = useState('');
  const [prizePos, setPrizePos] = useState(1);
  const [prizeAmount, setPrizeAmount] = useState('');

  const [rubricName, setRubricName] = useState('Hackathon Judging Rubric');
  const [criteriaList, setCriteriaList] = useState([
    { name: 'Innovation & Originality', description: 'Uniqueness of solution', weight: 30, max_score: 10 },
    { name: 'Technical Execution', description: 'Architecture & code quality', weight: 30, max_score: 10 },
    { name: 'Impact & Utility', description: 'Practical value of solution', weight: 20, max_score: 10 },
    { name: 'Presentation Polish', description: 'Design & demo quality', weight: 20, max_score: 10 },
  ]);

  const [selectedJudgeId, setSelectedJudgeId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEventPortalData(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
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

  const loadEventPortalData = async (eventId) => {
    setLoading(true);
    setError('');
    try {
      const [evRes, rubRes, assignRes, projRes, resRes, usersRes] = await Promise.allSettled([
        apiClient.get(`/events/${eventId}`),
        apiClient.get(`/events/${eventId}/rubrics`),
        apiClient.get(`/events/${eventId}/assignments`),
        apiClient.get(`/gallery?event_id=${eventId}&limit=100`),
        apiClient.get(`/events/${eventId}/results`),
        apiClient.get('/users'),
      ]);

      if (evRes.status === 'fulfilled') setEventDetail(evRes.value.data);
      if (rubRes.status === 'fulfilled') setRubrics(rubRes.value.data || []);
      if (assignRes.status === 'fulfilled') setAssignments(assignRes.value.data || []);
      if (projRes.status === 'fulfilled') setProjects(projRes.value.data.items || []);
      if (resRes.status === 'fulfilled') setResults(resRes.value.data);
      if (usersRes.status === 'fulfilled') {
        setJudges(usersRes.value.data.filter((u) => u.role === 'JUDGE' || u.role === 'ADMIN'));
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load organizer portal data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/events', {
        name: eventName.trim(),
        description: eventDesc.trim(),
        start_date: new Date(eventStart).toISOString(),
        end_date: new Date(eventEnd).toISOString(),
        status: eventStatus,
      });
      setCreateEventOpen(false);
      setSuccess('Event created successfully!');
      await fetchEvents();
      setSelectedEventId(String(res.data.id));
    } catch (err) {
      alert(err.userMessage || 'Failed to create event.');
    }
  };

  const handleAddTrack = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/events/${selectedEventId}/tracks`, {
        name: trackName.trim(),
        description: trackDesc.trim(),
      });
      setAddTrackOpen(false);
      setTrackName('');
      setTrackDesc('');
      setSuccess('Track added successfully!');
      loadEventPortalData(selectedEventId);
    } catch (err) {
      alert(err.userMessage || 'Failed to add track.');
    }
  };

  const handleAddPrize = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/events/${selectedEventId}/prizes`, {
        name: prizeName.trim(),
        description: prizeDesc.trim(),
        position: parseInt(prizePos, 10),
        amount: prizeAmount.trim() || null,
      });
      setAddPrizeOpen(false);
      setPrizeName('');
      setPrizeDesc('');
      setPrizeAmount('');
      setSuccess('Prize added successfully!');
      loadEventPortalData(selectedEventId);
    } catch (err) {
      alert(err.userMessage || 'Failed to add prize.');
    }
  };

  const handleCreateRubric = async (e) => {
    e.preventDefault();
    const totalWeight = criteriaList.reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      alert(`Criterion weights must sum to exactly 100%. Current sum: ${totalWeight}%`);
      return;
    }

    try {
      await apiClient.post(`/events/${selectedEventId}/rubrics`, {
        name: rubricName.trim(),
        criteria: criteriaList.map((c, idx) => ({
          name: c.name.trim(),
          description: c.description?.trim() || null,
          weight: parseFloat(c.weight),
          max_score: parseFloat(c.max_score),
          ordering: idx + 1,
        })),
      });
      setCreateRubricOpen(false);
      setSuccess('Rubric created and activated successfully!');
      loadEventPortalData(selectedEventId);
    } catch (err) {
      alert(err.userMessage || 'Failed to create rubric.');
    }
  };

  const handleAssignJudge = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/events/${selectedEventId}/assignments`, {
        judge_id: parseInt(selectedJudgeId, 10),
        project_id: parseInt(selectedProjectId, 10),
      });
      setAssignJudgeOpen(false);
      setSuccess('Judge assigned successfully!');
      loadEventPortalData(selectedEventId);
    } catch (err) {
      alert(err.userMessage || 'Failed to assign judge.');
    }
  };

  const handleExportCSV = async (detailed = false) => {
    try {
      const endpoint = detailed
        ? `/events/${selectedEventId}/export/detailed-csv`
        : `/events/${selectedEventId}/export/csv`;
      const response = await apiClient.get(endpoint, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${selectedEventId}_${detailed ? 'detailed' : 'leaderboard'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(err.userMessage || 'Failed to export CSV.');
    }
  };

  const totalWeightSum = criteriaList.reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Organizer Management Portal
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Control hackathons, tracks, prizes, rubric criteria, judge assignments, and score exports.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {events.length > 0 && (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.status})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setCreateEventOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading event portal..." />
      ) : !eventDetail ? (
        <EmptyState
          title="No Hackathon Selected"
          description="Create a new hackathon event or select one from the menu to manage."
        />
      ) : (
        <div className="space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow">
              <div className="text-xs font-semibold text-slate-400">Total Projects</div>
              <div className="text-2xl font-extrabold text-white mt-1">{projects.length}</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow">
              <div className="text-xs font-semibold text-slate-400">Assigned Judges</div>
              <div className="text-2xl font-extrabold text-indigo-400 mt-1">{assignments.length}</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow">
              <div className="text-xs font-semibold text-slate-400">Total Evaluations</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">{results?.total_evaluations || 0}</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow">
              <div className="text-xs font-semibold text-slate-400">Active Rubrics</div>
              <div className="text-2xl font-extrabold text-purple-400 mt-1">{rubrics.length}</div>
            </div>
          </div>

          {/* Section 1: Tracks & Prizes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tracks */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Tracks ({eventDetail.tracks?.length || 0})</h3>
                </div>
                <button
                  onClick={() => setAddTrackOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  + Add Track
                </button>
              </div>

              <div className="space-y-2.5">
                {eventDetail.tracks?.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{t.name}</div>
                      {t.description && <div className="text-slate-400 text-[11px] mt-0.5">{t.description}</div>}
                    </div>
                    <Badge variant={t.is_active ? 'primary' : 'default'}>Active</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Prizes */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Prizes ({eventDetail.prizes?.length || 0})</h3>
                </div>
                <button
                  onClick={() => setAddPrizeOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  + Add Prize
                </button>
              </div>

              <div className="space-y-2.5">
                {eventDetail.prizes?.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">#{p.position} - {p.name}</div>
                      {p.description && <div className="text-slate-400 text-[11px] mt-0.5">{p.description}</div>}
                    </div>
                    {p.amount && <span className="font-extrabold text-emerald-400 font-mono">{p.amount}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Rubric & Judge Assignments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rubrics */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">Scoring Rubrics</h3>
                </div>
                <button
                  onClick={() => setCreateRubricOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  + New Rubric
                </button>
              </div>

              {rubrics.length === 0 ? (
                <p className="text-xs text-slate-500">No active rubric configured.</p>
              ) : (
                <div className="space-y-4">
                  {rubrics.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{r.name}</span>
                        <Badge variant="success">Active Rubric</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                        {r.criteria?.map((c) => (
                          <div key={c.id} className="p-2 rounded bg-slate-900 border border-slate-800/60 flex justify-between">
                            <span>{c.name}</span>
                            <span className="font-bold text-indigo-400">{c.weight}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Judge Assignments */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Judge Assignments ({assignments.length})</h3>
                </div>
                <button
                  onClick={() => setAssignJudgeOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  + Assign Judge
                </button>
              </div>

              {assignments.length === 0 ? (
                <p className="text-xs text-slate-500">No judges assigned to projects yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {assignments.map((a) => (
                    <div key={a.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{a.judge?.name || `Judge #${a.judge_id}`}</span>
                        <span className="text-slate-500 mx-1.5">&rarr;</span>
                        <span className="text-indigo-300">{a.project?.name || `Project #${a.project_id}`}</span>
                      </div>
                      <Badge variant="default">Assigned</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Results & CSV Export */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Event Results & Score Export</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  View calculated rankings and download RFC 4180 compliant CSV exports.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExportCSV(false)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Leaderboard CSV</span>
                </button>
                <button
                  onClick={() => handleExportCSV(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Detailed Scores CSV</span>
                </button>
              </div>
            </div>

            {!results || results.results.length === 0 ? (
              <p className="text-xs text-slate-500">No calculated results available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Project Name</th>
                      <th className="px-4 py-3">Team</th>
                      <th className="px-4 py-3">Track</th>
                      <th className="px-4 py-3">Judges</th>
                      <th className="px-4 py-3 text-right">Raw Avg</th>
                      <th className="px-4 py-3 text-right">Normalized Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {results.results.map((res) => (
                      <tr key={res.project_id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-bold text-white">#{res.rank}</td>
                        <td className="px-4 py-3 font-semibold text-white">{res.project_name}</td>
                        <td className="px-4 py-3 text-slate-400">{res.team_name}</td>
                        <td className="px-4 py-3">{res.track_name || 'General'}</td>
                        <td className="px-4 py-3">{res.evaluation_count}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-400">{res.raw_average_score.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{res.final_score.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Event */}
      <Modal isOpen={createEventOpen} onClose={() => setCreateEventOpen(false)} title="Create New Hackathon Event">
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Event Name</label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. AI Builder Sprint 2026"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={eventStart}
                onChange={(e) => setEventStart(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                required
                value={eventEnd}
                onChange={(e) => setEventEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition mt-2"
          >
            Create Hackathon
          </button>
        </form>
      </Modal>

      {/* Modal: Add Track */}
      <Modal isOpen={addTrackOpen} onClose={() => setAddTrackOpen(false)} title="Add Track to Event">
        <form onSubmit={handleAddTrack} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Track Name</label>
            <input
              type="text"
              required
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              placeholder="e.g. AI & Machine Learning"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={trackDesc}
              onChange={(e) => setTrackDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            Save Track
          </button>
        </form>
      </Modal>

      {/* Modal: Add Prize */}
      <Modal isOpen={addPrizeOpen} onClose={() => setAddPrizeOpen(false)} title="Add Prize Category">
        <form onSubmit={handleAddPrize} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Prize Title</label>
            <input
              type="text"
              required
              value={prizeName}
              onChange={(e) => setPrizeName(e.target.value)}
              placeholder="e.g. 1st Place Grand Winner"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Position / Rank</label>
              <input
                type="number"
                min="1"
                required
                value={prizePos}
                onChange={(e) => setPrizePos(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount / Reward</label>
              <input
                type="text"
                value={prizeAmount}
                onChange={(e) => setPrizeAmount(e.target.value)}
                placeholder="e.g. $10,000"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            Save Prize
          </button>
        </form>
      </Modal>

      {/* Modal: Create Rubric */}
      <Modal isOpen={createRubricOpen} onClose={() => setCreateRubricOpen(false)} title="Configure Judging Rubric" maxWidth="max-w-2xl">
        <form onSubmit={handleCreateRubric} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Rubric Name</label>
            <input
              type="text"
              required
              value={rubricName}
              onChange={(e) => setRubricName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400">Criteria List</span>
            <span className={`text-xs font-bold ${Math.abs(totalWeightSum - 100) < 0.01 ? 'text-emerald-400' : 'text-rose-400'}`}>
              Total Weight: {totalWeightSum}% (Must equal 100%)
            </span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {criteriaList.map((crit, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  required
                  placeholder="Criterion Name"
                  value={crit.name}
                  onChange={(e) => {
                    const copy = [...criteriaList];
                    copy[idx].name = e.target.value;
                    setCriteriaList(copy);
                  }}
                  className="col-span-5 px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-800 text-white"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  placeholder="Weight %"
                  value={crit.weight}
                  onChange={(e) => {
                    const copy = [...criteriaList];
                    copy[idx].weight = e.target.value;
                    setCriteriaList(copy);
                  }}
                  className="col-span-3 px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-800 text-white text-right"
                />
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Max pts"
                  value={crit.max_score}
                  onChange={(e) => {
                    const copy = [...criteriaList];
                    copy[idx].max_score = e.target.value;
                    setCriteriaList(copy);
                  }}
                  className="col-span-3 px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-800 text-white text-right"
                />
                <button
                  type="button"
                  onClick={() => setCriteriaList(criteriaList.filter((_, i) => i !== idx))}
                  className="col-span-1 text-slate-500 hover:text-rose-400 p-1 flex justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCriteriaList([...criteriaList, { name: 'New Criterion', description: '', weight: 10, max_score: 10 }])}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            + Add Another Criterion
          </button>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition mt-2"
          >
            Activate Rubric
          </button>
        </form>
      </Modal>

      {/* Modal: Assign Judge */}
      <Modal isOpen={assignJudgeOpen} onClose={() => setAssignJudgeOpen(false)} title="Assign Judge to Project">
        <form onSubmit={handleAssignJudge} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Judge</label>
            <select
              required
              value={selectedJudgeId}
              onChange={(e) => setSelectedJudgeId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select a Judge...</option>
              {judges.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name} ({j.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Project</label>
            <select
              required
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select a Project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Team: {p.team?.name || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            Confirm Assignment
          </button>
        </form>
      </Modal>
    </div>
  );
}
