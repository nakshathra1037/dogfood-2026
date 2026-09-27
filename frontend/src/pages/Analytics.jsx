import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, Users, Award, AlertCircle, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import apiClient from '../api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import StatCard from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4'];

export default function Analytics() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState({
    totalRegistrations: 0,
    totalSubmissions: 0,
    avgTeamSize: '0.0',
    activeCategories: 0,
    conversionRate: '0%',
    totalTeams: 0,
  });

  const [registrationTrends, setRegistrationTrends] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [teamSizes, setTeamSizes] = useState([]);

  useEffect(() => {
    loadEventsAndAnalytics();
  }, []);

  const loadEventsAndAnalytics = async (eventIdOverride = null) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Events List
      const eventsRes = await apiClient.get('/events?limit=50');
      const eventList = eventsRes.data?.items || [];
      setEvents(eventList);

      const activeEventId = eventIdOverride || selectedEventId || (eventList.length > 0 ? eventList[0].id : null);
      if (activeEventId) {
        setSelectedEventId(activeEventId);
        await fetchEventAnalytics(activeEventId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError(err.userMessage || 'Could not fetch real-time analytics from backend.');
      setLoading(false);
    }
  };

  const fetchEventAnalytics = async (eventId) => {
    try {
      // Fetch Event Detail, Teams, Projects in parallel
      const [eventRes, teamsRes, projectsRes] = await Promise.all([
        apiClient.get(`/events/${eventId}`).catch(() => ({ data: {} })),
        apiClient.get(`/events/${eventId}/teams?limit=100`).catch(() => ({ data: { items: [] } })),
        apiClient.get(`/gallery?event_id=${eventId}&limit=100`).catch(() => ({ data: { items: [] } })),
      ]);

      const eventData = eventRes.data || {};
      const teams = teamsRes.data?.items || [];
      const projects = projectsRes.data?.items || [];

      // 1. Calculate Metrics
      const totalTeams = teams.length;
      const totalMembers = teams.reduce((acc, t) => acc + (t.members?.length || 1), 0);
      const totalSubmissions = projects.length;
      const avgTeamSize = totalTeams > 0 ? (totalMembers / totalTeams).toFixed(1) : '0.0';
      const activeTracks = eventData.tracks ? eventData.tracks.filter((t) => t.is_active !== false).length : 0;
      const conversionRate = totalTeams > 0 ? ((totalSubmissions / totalTeams) * 100).toFixed(0) + '%' : '0%';

      setMetrics({
        totalRegistrations: totalMembers || totalTeams,
        totalSubmissions,
        avgTeamSize,
        activeCategories: activeTracks,
        conversionRate,
        totalTeams,
      });

      // 2. Category / Track Distribution
      const tracksMap = {};
      if (eventData.tracks) {
        eventData.tracks.forEach((t) => {
          tracksMap[t.id] = { name: t.name, count: 0 };
        });
      }

      projects.forEach((p) => {
        const trackName = p.track?.name || (p.track_id && tracksMap[p.track_id]?.name) || 'General Track';
        if (!tracksMap[p.track_id]) {
          tracksMap[p.track_id || trackName] = { name: trackName, count: 0 };
        }
        tracksMap[p.track_id || trackName].count += 1;
      });

      const catDist = Object.values(tracksMap)
        .filter((item) => item.count > 0 || projects.length === 0)
        .map((item, idx) => ({
          name: item.name,
          value: item.count || 1,
          color: PALETTE[idx % PALETTE.length],
        }));

      setCategoryDistribution(catDist.length > 0 ? catDist : [{ name: 'No Projects Yet', value: 1, color: '#475569' }]);

      // 3. Team Size Breakdown
      const sizeCounts = { Solo: 0, '2 Members': 0, '3 Members': 0, '4+ Members': 0 };
      teams.forEach((t) => {
        const count = t.members?.length || 1;
        if (count === 1) sizeCounts['Solo']++;
        else if (count === 2) sizeCounts['2 Members']++;
        else if (count === 3) sizeCounts['3 Members']++;
        else sizeCounts['4+ Members']++;
      });

      setTeamSizes([
        { size: 'Solo (1)', count: sizeCounts['Solo'] },
        { size: '2 Members', count: sizeCounts['2 Members'] },
        { size: '3 Members', count: sizeCounts['3 Members'] },
        { size: '4+ Members', count: sizeCounts['4+ Members'] },
      ]);

      // 4. Growth Trends (by Date)
      const dateMap = {};
      const addDateEntry = (dateStr, type) => {
        if (!dateStr) return;
        const formatted = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dateMap[formatted]) {
          dateMap[formatted] = { date: formatted, registrations: 0, submissions: 0 };
        }
        if (type === 'reg') dateMap[formatted].registrations++;
        if (type === 'sub') dateMap[formatted].submissions++;
      };

      teams.forEach((t) => addDateEntry(t.created_at, 'reg'));
      projects.forEach((p) => addDateEntry(p.submitted_at || p.created_at, 'sub'));

      const trendArray = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));

      if (trendArray.length === 0) {
        const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        setRegistrationTrends([{ date: todayStr, registrations: totalMembers || totalTeams, submissions: totalSubmissions }]);
      } else {
        let runningReg = 0;
        let runningSub = 0;
        const cumulativeTrends = trendArray.map((item) => {
          runningReg += item.registrations;
          runningSub += item.submissions;
          return {
            date: item.date,
            registrations: runningReg,
            submissions: runningSub,
          };
        });
        setRegistrationTrends(cumulativeTrends);
      }
    } catch (err) {
      console.error('Failed to compute event metrics:', err);
      setError('Failed to compute analytics for the selected event.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e) => {
    const newId = Number(e.target.value);
    setSelectedEventId(newId);
    setLoading(true);
    fetchEventAnalytics(newId);
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Fetching live backend analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Event Analytics & Recharts Dashboards
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time analytics fetched directly from backend `/api/v1` events, teams, and submissions database.
          </p>
        </div>

        {events.length > 0 && (
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <span className="text-xs font-medium text-slate-400">Event:</span>
            <select
              value={selectedEventId || ''}
              onChange={handleEventChange}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-slate-900 text-white">
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadEventsAndAnalytics(selectedEventId)}
            className="inline-flex items-center space-x-1 font-semibold text-rose-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registrations"
          value={metrics.totalRegistrations}
          change={`From ${metrics.totalTeams} Teams`}
          changeType="positive"
          icon={Users}
          accentColor="indigo"
        />
        <StatCard
          title="Total Submissions"
          value={metrics.totalSubmissions}
          change={`${metrics.conversionRate} team conversion`}
          changeType="positive"
          icon={Award}
          accentColor="emerald"
        />
        <StatCard
          title="Avg Team Size"
          value={metrics.avgTeamSize}
          change="Members / Team"
          changeType="neutral"
          icon={BarChart3}
          accentColor="purple"
        />
        <StatCard
          title="Active Categories"
          value={metrics.activeCategories}
          change="Tracks Defined"
          changeType="positive"
          icon={PieChart}
          accentColor="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration & Submission Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle icon={TrendingUp}>Registration & Submission Growth</CardTitle>
            <CardDescription>Daily growth trend from live database records</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="subGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="registrations" stroke="#6366f1" fillOpacity={1} fill="url(#regGradient)" name="Registrations" />
                <Area type="monotone" dataKey="submissions" stroke="#10b981" fillOpacity={1} fill="url(#subGradient)" name="Submissions" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle icon={PieChart}>Category Distribution</CardTitle>
            <CardDescription>Share of project entries by event tracks</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Size Distribution Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle icon={BarChart3}>Team Size Breakdown</CardTitle>
            <CardDescription>Distribution of hacker team sizes from backend teams database</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamSizes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="size" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Teams" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
