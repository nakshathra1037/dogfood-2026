import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  Award,
  BarChart3,
  PlusCircle,
  Sliders,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { mockHackathons } from '../data/mockHackathons';

export default function OrganizerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 border border-purple-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/50 text-purple-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Organizer Admin Control Panel</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Organizer Overview
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Manage hackathon events, track participant growth, evaluate submissions, and inspect platform analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button variant="emerald" icon={PlusCircle} onClick={() => navigate('/organizer/create-hackathon')}>
              Create Hackathon
            </Button>
            <Button variant="secondary" icon={BarChart3} onClick={() => navigate('/organizer/analytics')}>
              View Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Hackathons"
          value="3"
          change="2 Active"
          changeType="positive"
          icon={FolderGit2}
          accentColor="purple"
          description="Managed competitions"
        />
        <StatCard
          title="Registered Hackers"
          value="730"
          change="+120 this week"
          changeType="positive"
          icon={Users}
          accentColor="emerald"
          description="Across all events"
        />
        <StatCard
          title="Total Submissions"
          value="85"
          change="48 Evaluated"
          changeType="positive"
          icon={Award}
          accentColor="amber"
          description="Project entries"
        />
        <StatCard
          title="Avg Team Size"
          value="3.2"
          change="Optimal"
          changeType="neutral"
          icon={Sliders}
          accentColor="indigo"
          description="Members per team"
        />
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Managed Competitions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle icon={FolderGit2}>Managed Competitions</CardTitle>
                <CardDescription>Live status of your hosted hackathons</CardDescription>
              </div>
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/organizer/hackathons')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockHackathons.map((h) => (
                <div key={h.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{h.title}</span>
                      <Badge variant={h.status === 'Active' ? 'success' : 'neutral'}>
                        {h.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400 block">{h.participantsCount} Hackers • {h.teamsCount} Teams</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => navigate('/organizer/submissions')}>
                      Submissions
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Shortcuts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle icon={Sliders}>Quick Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" icon={PlusCircle} onClick={() => navigate('/organizer/create-hackathon')}>
                Create New Hackathon
              </Button>
              <Button variant="outline" className="w-full justify-start" icon={Users} onClick={() => navigate('/organizer/participants')}>
                Manage Participants
              </Button>
              <Button variant="outline" className="w-full justify-start" icon={Award} onClick={() => navigate('/organizer/evaluations')}>
                Open Evaluation Rubric
              </Button>
              <Button variant="outline" className="w-full justify-start" icon={BarChart3} onClick={() => navigate('/organizer/analytics')}>
                View Recharts Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
