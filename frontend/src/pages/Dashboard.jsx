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
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Github,
  Linkedin,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { eventsApi } from '../api/events';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParticipantDashboard();
  }, []);

  const loadParticipantDashboard = async () => {
    setLoading(true);
    try {
      // 1. Fetch participant's registered events from backend
      const res = await eventsApi.getRegisteredEvents();
      const eventList = res.items || res || [];
      setRegisteredEvents(eventList);

      // 2. If registered for events, fetch associated team rosters
      if (eventList.length > 0) {
        const teamPromises = eventList.map(async (ev) => {
          try {
            const regs = await eventsApi.getEventRegistrations(ev.id);
            const myReg = regs.find((r) => r.user_id === user?.id);
            return myReg ? { ...myReg, eventName: ev.name || ev.title } : null;
          } catch {
            return null;
          }
        });
        const teamResults = (await Promise.all(teamPromises)).filter(Boolean);
        setTeams(teamResults);
      } else {
        setTeams([]);
      }
    } catch (err) {
      console.error('Failed to load participant dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner message="Loading your participant workspace from database..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/70 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Participant Workspace • {user?.name || user?.email}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hacker Dashboard
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              View your registered hackathons, personal registration records, team rosters, and competition deadlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="emerald"
              icon={Sparkles}
              onClick={() => navigate('/hackathons')}
            >
              Explore Hackathons
            </Button>
            <Button
              variant="secondary"
              icon={Users}
              onClick={() => navigate('/dashboard/teams')}
            >
              My Teams
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Registered Hackathons"
          value={registeredEvents.length}
          change="Confirmed Entries"
          changeType="positive"
          icon={FolderGit2}
          accentColor="indigo"
          description="Active registrations"
        />
        <StatCard
          title="Active Teams"
          value={teams.length}
          change={teams.length > 0 ? teams[0].team_name : 'No team yet'}
          changeType="positive"
          icon={Users}
          accentColor="emerald"
          description="Squad rosters"
        />
        <StatCard
          title="Submissions Open"
          value={registeredEvents.filter((e) => e.status === 'ACTIVE').length}
          change="Active Challenges"
          changeType="positive"
          icon={Award}
          accentColor="amber"
          description="Ready for project entry"
        />
        <StatCard
          title="Upcoming Deadlines"
          value={registeredEvents.length > 0 ? formatDate(registeredEvents[0].end_date) : 'None'}
          change="Submission Cutoff"
          changeType="neutral"
          icon={Clock}
          accentColor="purple"
          description="Next key milestone"
        />
      </div>

      {/* 2-Column Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Registration Details + My Hackathons */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: My Registration Profile (Requirement 5) */}
          <Card className="border-indigo-500/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <CardTitle icon={User}>My Registration Profile</CardTitle>
                <CardDescription>
                  Your verified participant details linked to event registrations
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/profile')}
              >
                Edit Profile
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 block font-medium">Full Name</span>
                  <span className="font-semibold text-white text-sm">{user?.name || 'Alex Chen'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 block font-medium">Email Address</span>
                  <span className="font-mono text-slate-200 text-sm">{user?.email}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 block font-medium">Role Status</span>
                  <Badge variant="emerald" className="mt-0.5">
                    {user?.role || 'PARTICIPANT'}
                  </Badge>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 block font-medium">Academic Roster</span>
                  <span className="text-slate-300">Computer Science &bull; 3rd Year</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: My Registered Hackathons (Requirement 5) */}
          <Card className="border-slate-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <CardTitle icon={FolderGit2}>My Registered Hackathons</CardTitle>
                <CardDescription>
                  Competitions you are registered for and currently participating in
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/dashboard/hackathons')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {registeredEvents.length === 0 ? (
                <div className="p-8 text-center space-y-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-xs text-slate-300 font-semibold">
                    You haven't registered for any hackathons yet.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Explore active challenges, build innovative solutions, and compete for prizes!
                  </p>
                  <Button
                    variant="emerald"
                    size="sm"
                    icon={Sparkles}
                    onClick={() => navigate('/hackathons')}
                  >
                    Explore Hackathons
                  </Button>
                </div>
              ) : (
                registeredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {ev.name || ev.title}
                        </span>
                        <Badge variant="emerald" className="text-[10px]">
                          Registered
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {ev.description || 'No description provided.'}
                      </p>
                      <span className="text-[11px] font-mono text-purple-300 mt-1 block">
                        Dates: {formatDate(ev.start_date)} &mdash; {formatDate(ev.end_date)}
                      </span>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/hackathons/${ev.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Reminders, Deadlines & Team Overview */}
        <div className="space-y-6">
          {/* Reminders & Updates (Requirement 5) */}
          <Card className="border-purple-500/20 shadow-xl">
            <CardHeader>
              <CardTitle icon={Clock}>Reminders &amp; Deadlines</CardTitle>
              <CardDescription>Key event dates from live database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {registeredEvents.length === 0 ? (
                <p className="text-slate-400 text-xs p-3 text-center">
                  No active deadlines. Register for a hackathon to track deadlines!
                </p>
              ) : (
                registeredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <span className="font-semibold text-white block line-clamp-1">
                      {ev.name}
                    </span>
                    <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                      <span>Cutoff:</span>
                      <span className="text-emerald-400 font-bold">{formatDate(ev.end_date)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="border-slate-800 shadow-xl">
            <CardHeader>
              <CardTitle icon={Layers}>Participant Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-xs"
                icon={Sparkles}
                onClick={() => navigate('/hackathons')}
              >
                Browse All Hackathons
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs"
                icon={Users}
                onClick={() => navigate('/dashboard/teams')}
              >
                Manage My Teams
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs"
                icon={Award}
                onClick={() => navigate('/dashboard/submissions')}
              >
                My Project Submissions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
