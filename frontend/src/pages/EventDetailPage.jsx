import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  Trophy,
  Layers,
  FileSpreadsheet,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  Medal,
  Award,
  Sparkles,
  UserPlus,
} from 'lucide-react';

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOrganizer, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [rubric, setRubric] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'leaderboard' | 'rubric'
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const [evRes, rubRes, resRes] = await Promise.allSettled([
        apiClient.get(`/events/${id}`),
        apiClient.get(`/events/${id}/rubrics/active`),
        apiClient.get(`/events/${id}/results`),
      ]);

      if (evRes.status === 'fulfilled') setEvent(evRes.value.data);
      if (rubRes.status === 'fulfilled') setRubric(rubRes.value.data);
      if (resRes.status === 'fulfilled') setResults(resRes.value.data);
    } catch (err) {
      console.error('Failed to load event detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async (detailed = false) => {
    setDownloading(true);
    try {
      const endpoint = detailed
        ? `/events/${id}/export/detailed-csv`
        : `/events/${id}/export/csv`;
      const response = await apiClient.get(endpoint, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `event_${id}_${detailed ? 'detailed_evaluations' : 'results'}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(err.userMessage || 'Failed to download CSV export.');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <LoadingSpinner message="Loading event information..." />;
  if (!event) return <EmptyState title="Event Not Found" description="The requested event could not be found." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <Badge variant="primary">Event #{event.id}</Badge>
            <Badge variant={event.status === 'ACTIVE' ? 'success' : 'default'}>
              {event.status}
            </Badge>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{formatDate(event.start_date)} &mdash; {formatDate(event.end_date)}</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          {event.name}
        </h1>
        <p className="text-sm text-slate-300 max-w-4xl leading-relaxed whitespace-pre-line">
          {event.description || 'No description provided.'}
        </p>

        {/* Quick Action Links */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Overview & Prizes
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'leaderboard'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Live Leaderboard ({results?.results?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('rubric')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'rubric'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Rubric Criteria
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {!isOrganizer && (
              <button
                onClick={() => navigate(`/events/${id}/register`)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Register Hackathon</span>
              </button>
            )}

            {isOrganizer && (
              <>
                <button
                  onClick={() => handleExportCSV(false)}
                  disabled={downloading}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Leaderboard CSV</span>
                </button>
                <button
                  onClick={() => handleExportCSV(true)}
                  disabled={downloading}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Detailed Scores CSV</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tracks */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Competition Tracks</h2>
            </div>
            {event.tracks?.length === 0 ? (
              <p className="text-xs text-slate-500">No tracks specified for this event.</p>
            ) : (
              <div className="space-y-3">
                {event.tracks.map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                      <Badge variant={t.is_active ? 'primary' : 'default'}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {t.description && (
                      <p className="mt-1 text-xs text-slate-400">{t.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prizes */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Prize Categories</h2>
            </div>
            {event.prizes?.length === 0 ? (
              <p className="text-xs text-slate-500">No prizes configured for this event.</p>
            ) : (
              <div className="space-y-3">
                {event.prizes.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Medal className="w-4 h-4 text-amber-400" />
                        <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                      </div>
                      {p.description && (
                        <p className="mt-1 text-xs text-slate-400">{p.description}</p>
                      )}
                    </div>
                    {p.amount && (
                      <span className="text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {p.amount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Event Standings & Calculated Results</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated deterministically using Cross-Judge Z-Score normalization and rubric criteria weights.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span>Total Submitted Projects: <strong>{results?.total_projects || 0}</strong></span>
              <span>•</span>
              <span>Total Evaluations: <strong>{results?.total_evaluations || 0}</strong></span>
            </div>
          </div>

          {!results || results.results.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              No judging evaluations submitted yet. Standings will appear once judging commences.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Rank</th>
                    <th className="px-6 py-3.5">Project Name</th>
                    <th className="px-6 py-3.5">Team</th>
                    <th className="px-6 py-3.5">Track</th>
                    <th className="px-6 py-3.5">Evaluations</th>
                    <th className="px-6 py-3.5 text-right">Raw Avg</th>
                    <th className="px-6 py-3.5 text-right">Normalized Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {results.results.map((res) => (
                    <tr key={res.project_id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-bold text-white">
                        <div className="flex items-center space-x-1.5">
                          {res.rank === 1 && <Trophy className="w-4 h-4 text-amber-400" />}
                          {res.rank === 2 && <Medal className="w-4 h-4 text-slate-300" />}
                          {res.rank === 3 && <Medal className="w-4 h-4 text-amber-700" />}
                          <span>#{res.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {res.project_name}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{res.team_name}</td>
                      <td className="px-6 py-4">
                        {res.track_name ? <Badge variant="primary">{res.track_name}</Badge> : '-'}
                      </td>
                      <td className="px-6 py-4">{res.evaluation_count} judges</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-400">
                        {res.raw_average_score.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400 text-sm">
                        {res.final_score.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Rubric */}
      {activeTab === 'rubric' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">{rubric?.name || 'Evaluation Rubric'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official scoring criteria configured by hackathon organizers.
              </p>
            </div>
            {rubric && (
              <Badge variant={rubric.status === 'ACTIVE' ? 'success' : 'default'}>
                Status: {rubric.status} (v{rubric.version})
              </Badge>
            )}
          </div>

          {!rubric?.criteria || rubric.criteria.length === 0 ? (
            <p className="text-xs text-slate-500">No criteria defined for this rubric yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rubric.criteria.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white">{c.name}</h4>
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {c.weight}% Weight
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{c.description || 'No description provided.'}</p>
                  <div className="text-xs text-slate-500">Maximum Score: {c.max_score} pts</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
