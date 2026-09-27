import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  Award,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  Bell,
  Sparkles,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { mockHackathons } from '../data/mockHackathons';
import { mockTeams } from '../data/mockTeams';
import { mockSubmissions } from '../data/mockSubmissions';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hacker Workspace • {user?.name || 'Alex Chen'}</span>
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
          value="2"
          change="Active"
          changeType="positive"
          icon={FolderGit2}
          accentColor="indigo"
          description="Participating competitions"
        />
        <StatCard
          title="Active Teams"
          value="1"
          change="NeuralBytes"
          changeType="positive"
          icon={Users}
          accentColor="emerald"
          description="Roster complete (3/4)"
        />
        <StatCard
          title="Submissions"
          value="1 / 2"
          change="1 Submitted"
          changeType="positive"
          icon={Award}
          accentColor="amber"
          description="Project entries"
        />
        <StatCard
          title="Next Deadline"
          value="Oct 03"
          change="in 6 days"
          changeType="neutral"
          icon={Clock}
          accentColor="purple"
          description="Submission cutoff"
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
                <CardDescription>Hackathons you are currently participating in</CardDescription>
              </div>
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/dashboard/hackathons')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockHackathons.slice(0, 2).map((h) => (
                <div key={h.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{h.title}</span>
                      <Badge variant="success" pulse className="text-[10px]">
                        {h.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{h.tagline}</p>
                    <span className="text-[11px] font-mono text-indigo-400 block mt-2">Prize: {h.prizePool}</span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/hackathons/${h.id}`)}>
                    View Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submissions Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle icon={Award}>My Submissions</CardTitle>
                <CardDescription>Status of your project entries</CardDescription>
              </div>
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/dashboard/submissions')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockSubmissions.map((sub) => (
                <div key={sub.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 text-sm">{sub.projectName}</span>
                    <span className="text-xs text-slate-400 block">{sub.hackathonTitle}</span>
                  </div>
                  <Badge variant={sub.status === 'Submitted' ? 'success' : 'warning'}>
                    {sub.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity Feed & Upcoming Deadlines */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle icon={Bell}>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex gap-3 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold block">Submitted project EchoMesh AI</span>
                  <span className="text-slate-500 font-mono text-[10px]">2 hours ago</span>
                </div>
              </div>
              <div className="flex gap-3 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold block">Joined team NeuralBytes</span>
                  <span className="text-slate-500 font-mono text-[10px]">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-900/40 bg-slate-900/90">
            <CardHeader>
              <CardTitle icon={Clock}>Deadlines Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800">
                <span>DOGFOOD 2026 Submission:</span>
                <span className="font-mono text-emerald-400 font-semibold">Oct 03</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800">
                <span>CyberShield Registration:</span>
                <span className="font-mono text-indigo-400 font-semibold">Oct 15</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
