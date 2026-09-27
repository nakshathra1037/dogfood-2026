import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Plus,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const mockSubmissions = [
  {
    id: 'sub-1',
    title: 'EchoMesh Local AI',
    tagline: 'Decentralized peer-to-peer LLM runner for off-grid edge devices',
    author: 'Team NeuralBytes',
    status: 'Evaluated',
    score: 94.5,
    category: 'AI & Infra',
    submittedAt: '2 hours ago',
  },
  {
    id: 'sub-2',
    title: 'ZeroVault KV',
    tagline: 'High-throughput transactional key-value store built with Rust',
    author: 'Alex Vance',
    status: 'Under Review',
    score: null,
    category: 'Systems',
    submittedAt: '4 hours ago',
  },
  {
    id: 'sub-3',
    title: 'FlowState UI',
    tagline: 'Automated canvas-based node editor for microservice workflows',
    author: 'Team Canvas',
    status: 'Submitted',
    score: null,
    category: 'Developer Tools',
    submittedAt: '6 hours ago',
  },
];

const mockCriteria = [
  { name: 'Technical Complexity', weight: '30%', maxScore: 10, icon: '⚡' },
  { name: 'Originality & Innovation', weight: '25%', maxScore: 10, icon: '💡' },
  { name: 'User Experience & UI', weight: '25%', maxScore: 10, icon: '🎨' },
  { name: 'Practical Utility', weight: '20%', maxScore: 10, icon: '🚀' },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Event Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>DOGFOOD Hackathon Edition 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Evaluation & Judging Hub
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Welcome to the local judging panel. Evaluate project submissions, review scoring rubrics, and manage leaderboard statistics directly on your machine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="emerald"
              icon={Award}
              onClick={() => navigate('/judging')}
            >
              Start Judging
            </Button>
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() => navigate('/submissions')}
            >
              View Projects
            </Button>
          </div>
        </div>

        {/* Decorative Ambient Background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Submissions"
          value="12"
          change="+3 today"
          changeType="positive"
          icon={FolderGit2}
          accentColor="indigo"
          description="Projects registered"
        />
        <StatCard
          title="Active Judges"
          value="4"
          change="100% online"
          changeType="positive"
          icon={Users}
          accentColor="emerald"
          description="Local evaluation node"
        />
        <StatCard
          title="Evaluations Done"
          value="18 / 36"
          change="50% completed"
          changeType="neutral"
          icon={Award}
          accentColor="amber"
          description="Scoring progress"
        />
        <StatCard
          title="Time Remaining"
          value="04:18:20"
          change="Judging Active"
          changeType="positive"
          icon={Clock}
          accentColor="purple"
          description="Submission cutoff"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submissions Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle icon={FolderGit2}>Recent Submissions</CardTitle>
                <CardDescription>Latest project entries pending evaluation</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/submissions')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-800/60">
                {mockSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100">{sub.title}</span>
                        <Badge variant="neutral" className="text-[10px]">
                          {sub.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{sub.tagline}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span>By {sub.author}</span>
                        <span>•</span>
                        <span>{sub.submittedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      {sub.score !== null ? (
                        <div className="text-right">
                          <span className="text-xs font-mono text-emerald-400 font-semibold block">
                            {sub.score} / 100
                          </span>
                          <Badge variant="success" className="text-[10px]">
                            Evaluated
                          </Badge>
                        </div>
                      ) : sub.status === 'Under Review' ? (
                        <Badge variant="warning" pulse className="text-[10px]">
                          Under Review
                        </Badge>
                      ) : (
                        <Badge variant="info" className="text-[10px]">
                          Pending
                        </Badge>
                      )}

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/judging')}
                      >
                        Evaluate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evaluation Rubrics & System Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle icon={BarChart3}>Evaluation Rubric</CardTitle>
              <CardDescription>Active criteria weights for scoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCriteria.map((criterion, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{criterion.icon}</span>
                    <div>
                      <span className="font-medium text-slate-200 block">{criterion.name}</span>
                      <span className="text-[10px] text-slate-400">Max Score: {criterion.maxScore} pts</span>
                    </div>
                  </div>
                  <Badge variant="indigo" className="font-mono text-[11px]">
                    {criterion.weight}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Local Compliance Alert Card */}
          <Card className="border-indigo-900/40 bg-gradient-to-b from-indigo-950/30 to-slate-900">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 font-medium text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Cloud Dependency</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                DOGFOOD 2026 runs entirely on your local machine using FastAPI, React, and PostgreSQL inside Docker containers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
