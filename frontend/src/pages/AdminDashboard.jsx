import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  Award,
  Calendar,
  Sparkles,
  PlusCircle,
  RefreshCw,
  Eye,
  Edit,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { eventsApi } from '../api/events';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [stats, setStats] = useState({
    total_hackathons: 0,
    published_hackathons: 0,
    total_teams: 0,
    total_registrations: 0,
    total_participants: 0,
    upcoming_hackathons: 0,
  });

  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Load Admin Stats from database
      const statsRes = await eventsApi.getAdminStats().catch(() => null);
      if (statsRes) {
        setStats(statsRes);
      }

      // 2. Load all events (including drafts) from backend
      const eventsRes = await eventsApi.getEvents({ limit: 50 });
      const items = eventsRes.items || eventsRes || [];

      // 3. For each event, fetch registration count from database
      const enrichedEvents = await Promise.all(
        items.map(async (ev) => {
          try {
            const regs = await eventsApi.getEventRegistrations(ev.id);
            return {
              ...ev,
              registrationCount: Array.isArray(regs) ? regs.length : 0,
            };
          } catch {
            return {
              ...ev,
              registrationCount: 0,
            };
          }
        })
      );

      setHackathons(enrichedEvents);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      toastError('Failed to load admin statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const togglePublishStatus = async (ev) => {
    const newStatus = ev.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      await eventsApi.updateEvent(ev.id, { status: newStatus });
      success(`Event "${ev.name}" is now ${newStatus === 'ACTIVE' ? 'Published' : 'Draft'}.`);
      loadAdminData();
    } catch (err) {
      toastError(err.userMessage || 'Failed to update event status');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Loading Admin Dashboard statistics from database..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/70 border border-purple-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/50 text-purple-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Console • {user?.name || user?.email}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hackathon Admin Dashboard
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Create, edit, publish competitions, monitor live registration numbers, and manage participants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={loadAdminData}
            >
              Refresh Stats
            </Button>
            <Button
              variant="emerald"
              icon={PlusCircle}
              onClick={() => navigate('/admin/create-hackathon')}
            >
              Create Hackathon
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row (Requirement 3: Total Hackathons, Published, Registrations, Participants, Teams, Upcoming) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Hackathons"
          value={stats.total_hackathons}
          change="In Database"
          changeType="neutral"
          icon={FolderGit2}
          accentColor="purple"
        />
        <StatCard
          title="Published / Active"
          value={stats.published_hackathons}
          change="Live Competitions"
          changeType="positive"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Total Registrations"
          value={stats.total_registrations}
          change="Real Registrations"
          changeType="positive"
          icon={Award}
          accentColor="indigo"
        />
        <StatCard
          title="Total Participants"
          value={stats.total_participants}
          change="Distinct Hackers"
          changeType="positive"
          icon={Users}
          accentColor="cyan"
        />
        <StatCard
          title="Total Teams"
          value={stats.total_teams}
          change="Created Squads"
          changeType="positive"
          icon={Layers}
          accentColor="amber"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcoming_hackathons}
          change="Scheduled Events"
          changeType="neutral"
          icon={Clock}
          accentColor="purple"
        />
      </div>

      {/* Hackathons Management Overview */}
      <Card className="border-purple-500/20 shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <CardTitle icon={FolderGit2}>Hackathons Overview &amp; Live Registrations</CardTitle>
            <CardDescription>
              All hackathons saved in database with live real-time participant counts
            </CardDescription>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/admin/hackathons')}
          >
            Manage All ({hackathons.length})
          </Button>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-800/80">
          {hackathons.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hackathons found in database. Click 'Create Hackathon' to publish your first competition!
            </div>
          ) : (
            hackathons.map((ev) => (
              <div
                key={ev.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-base hover:text-purple-400 transition-colors">
                      {ev.name || ev.title}
                    </span>
                    <Badge
                      variant={
                        ev.status === 'ACTIVE'
                          ? 'success'
                          : ev.status === 'DRAFT'
                          ? 'warning'
                          : 'neutral'
                      }
                      pulse={ev.status === 'ACTIVE'}
                    >
                      {ev.status || 'ACTIVE'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {ev.description || 'No description provided.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      {formatDate(ev.start_date)} &mdash; {formatDate(ev.end_date)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Live Registrations Count Badge (Requirement 14) */}
                  <div className="text-center px-4 py-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">
                      Registrations
                    </span>
                    <span className="text-lg font-extrabold text-emerald-400 font-mono">
                      {ev.registrationCount}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      onClick={() => navigate(`/admin/hackathons/${ev.id}/registrations`)}
                    >
                      View Registrations
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit}
                      onClick={() => navigate(`/admin/edit-hackathon/${ev.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublishStatus(ev)}
                      className={ev.status === 'ACTIVE' ? 'text-amber-400' : 'text-emerald-400'}
                    >
                      {ev.status === 'ACTIVE' ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
