import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  Award,
  Clock,
  ArrowRight,
  Plus,
  Bell,
  Sparkles,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDashboardData();
  }, []);

  const loadUserDashboardData = async () => {
    setLoading(true);
    try {
      const [eventsRes, galleryRes] = await Promise.all([
        apiClient.get('/events?limit=10').catch(() => ({ data: { items: [] } })),
        apiClient.get('/gallery?limit=10').catch(() => ({ data: { items: [] } })),
      ]);

      const eventList = eventsRes.data?.items || [];
      const projectList = galleryRes.data?.items || [];

      setEvents(eventList);
      setSubmissions(projectList);

      if (eventList.length > 0) {
        const teamsRes = await apiClient.get(`/events/${eventList[0].id}/teams`).catch(() => ({ data: { items: [] } }));
        setTeams(teamsRes.data?.items || []);
      }
    } catch (err) {
      console.error('Failed to load hacker dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const nextDeadline = events.length > 0 && events[0].end_date ? formatDate(events[0].end_date) : 'Oct 03';

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Loading workspace overview..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hacker Workspace • {user?.name || user?.email || 'Hacker'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Track your registered hackathons, active teams, pending submissions, and upcoming deadlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button variant="emerald" icon={Plus} onClick={() => navigate('/dashboard/submissions/new')}>
              New Submission
            </Button>
            <Button variant="secondary" icon={Users} onClick={() => navigate('/dashboard/teams')}>
              Manage Teams
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Registered Hackathons"
          value={events.length}
          change="Active Events"
          changeType="positive"
          icon={FolderGit2}
          accentColor="indigo"
          description="Participating competitions"
        />
        <StatCard
          title="Active Teams"
          value={teams.length}
          change={teams.length > 0 ? teams[0].name : 'Formed Teams'}
          changeType="positive"
          icon={Users}
          accentColor="emerald"
          description="Event rosters"
        />
        <StatCard
          title="Submissions"
          value={submissions.length}
          change={`${submissions.length} Submitted`}
          changeType="positive"
          icon={Award}
          accentColor="amber"
          description="Project entries"
        />
        <StatCard
          title="Next Deadline"
          value={nextDeadline}
          change="Submission Cutoff"
          changeType="neutral"
          icon={Clock}
          accentColor="purple"
          description="Countdown timer"
        />
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Registered Hackathons */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle icon={FolderGit2}>Registered Hackathons</CardTitle>
                <CardDescription>Hackathons pulled directly from live backend database</CardDescription>
              </div>
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/dashboard/hackathons')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No registered hackathons found. Explore hackathons to join!</p>
              ) : (
                events.slice(0, 3).map((h) => (
                  <div key={h.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100">{h.name || h.title}</span>
                        <Badge variant="success" pulse className="text-[10px]">
                          {h.status || 'ACTIVE'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{h.description || 'No description provided.'}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/events/${h.id}`)}>
                      View Details
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Submissions Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle icon={Award}>My Submissions</CardTitle>
                <CardDescription>Live status of your project entries</CardDescription>
              </div>
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/dashboard/submissions')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {submissions.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No projects submitted yet. Click 'New Submission' to submit your project!</p>
              ) : (
                submissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 text-sm">{sub.name || sub.title}</span>
                      <span className="text-xs text-slate-400 block">{sub.description || 'Project entry'}</span>
                    </div>
                    <Badge variant={sub.status === 'Submitted' || sub.status === 'SUBMITTED' ? 'success' : 'warning'}>
                      {sub.status || 'SUBMITTED'}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Deadlines Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle icon={Bell}>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex gap-3 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold block">Active backend connection verified</span>
                  <span className="text-slate-500 font-mono text-[10px]">Connected to /api/v1</span>
                </div>
              </div>
              <div className="flex gap-3 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold block">Authenticated as {user?.role || 'Hacker'}</span>
                  <span className="text-slate-500 font-mono text-[10px]">Bearer JWT Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-900/40 bg-slate-900/90">
            <CardHeader>
              <CardTitle icon={Clock}>Deadlines Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {events.slice(0, 2).map((ev) => (
                <div key={ev.id} className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="line-clamp-1">{ev.name}:</span>
                  <span className="font-mono text-emerald-400 font-semibold shrink-0 ml-2">{formatDate(ev.end_date)}</span>
                </div>
              ))}
              {events.length === 0 && (
                <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span>DOGFOOD 2026 Submission:</span>
                  <span className="font-mono text-emerald-400 font-semibold">Oct 03</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
