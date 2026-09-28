import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Code2,
  Terminal,
  Share2,
} from 'lucide-react';
import { hackathonService } from '../services/hackathonService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';

import apiClient from '../api/client';

export default function HackathonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await hackathonService.getHackathonById(id);
        const data = res.data;
        // Normalize fields for UI display
        const normalized = {
          id: data.id,
          title: data.name || data.title,
          description: data.description,
          status: data.status || 'ACTIVE',
          startDate: data.start_date ? new Date(data.start_date).toLocaleDateString() : data.startDate || 'TBD',
          endDate: data.end_date ? new Date(data.end_date).toLocaleDateString() : data.endDate || 'TBD',
          mode: data.mode || 'Online',
          category: data.category || 'Open Innovation',
          organizer: data.organizer || 'DOGFOOD Platform',
          tagline: data.tagline || (data.description ? data.description.slice(0, 120) + '...' : 'Global Developer Competition'),
          prizePool: data.prizePool || (data.prizes?.length ? data.prizes[0].amount || '$10,000' : '$10,000'),
          minTeamSize: data.minTeamSize || 1,
          maxTeamSize: data.maxTeamSize || 5,
          participantsCount: data.participantsCount || 1,
          bannerImage: data.bannerImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
          problemStatements: data.tracks?.length ? data.tracks.map(t => ({ id: t.id, title: t.name, description: t.description })) : data.problemStatements,
          prizes: data.prizes?.length ? data.prizes.map((p, idx) => ({ place: p.name, reward: p.amount || 'Award', badge: idx === 0 ? '🏆' : idx === 1 ? '🥈' : '🥉' })) : data.prizes,
          timeline: data.timeline || [
            { step: 'Registration Opens', date: data.start_date ? new Date(data.start_date).toLocaleDateString() : 'Active', status: 'completed' },
            { step: 'Hacking & Building', date: 'In Progress', status: 'current' },
            { step: 'Submission Deadline', date: data.end_date ? new Date(data.end_date).toLocaleDateString() : 'Closing Soon', status: 'upcoming' },
          ],
          technologies: data.technologies || ['React', 'FastAPI', 'Python', 'Docker', 'AI/ML'],
          ...data,
        };
        setHackathon(normalized);

        // Check if user is currently registered for this event
        if (isAuthenticated) {
          try {
            const regRes = await apiClient.get('/events/registered');
            const myEvents = regRes.data?.items || [];
            const isReg = myEvents.some((ev) => String(ev.id) === String(id));
            setRegistered(isReg);
          } catch {
            // Unauthenticated or offline
          }
        }
      } catch (err) {
        setError(err.message || 'Hackathon details not found');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isAuthenticated]);

  const handleRegister = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/hackathons/${id}/register` } } });
      return;
    }
    navigate(`/hackathons/${id}/register`);
  };

  if (loading) return <Loader fullPage message="Loading hackathon details..." />;
  if (error || !hackathon) return <ErrorState description={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/hackathons')}>
        Back to Hackathons
      </Button>

      {/* Hero Cover Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="h-64 sm:h-80 w-full relative">
          <img src={hackathon.bannerImage} alt={hackathon.title} className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 -mt-24 relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="indigo" pulse={hackathon.status === 'Active'}>
              {hackathon.status}
            </Badge>
            <Badge variant="neutral">{hackathon.mode}</Badge>
            <Badge variant="purple">{hackathon.category}</Badge>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs text-indigo-400 font-mono">Organized by {hackathon.organizer}</span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">{hackathon.title}</h1>
              <p className="text-slate-300 text-sm max-w-2xl">{hackathon.tagline}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {registered ? (
                <div className="flex items-center gap-2">
                  <Button variant="emerald" icon={CheckCircle2} disabled>
                    Registered
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/dashboard/hackathons')}>
                    My Hackathons &rarr;
                  </Button>
                </div>
              ) : (
                <Button variant="emerald" size="lg" isLoading={registering} onClick={handleRegister}>
                  Register for Event
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400">Prize Pool:</span>
          <span className="font-bold text-emerald-400 text-sm block">{hackathon.prizePool}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-400">Dates:</span>
          <span className="font-mono text-slate-200 block">{hackathon.startDate} - {hackathon.endDate}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-400">Team Size:</span>
          <span className="font-medium text-slate-200 block">{hackathon.minTeamSize} to {hackathon.maxTeamSize} Members</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-400">Registered Hackers:</span>
          <span className="font-bold text-indigo-400 text-sm block">{hackathon.participantsCount} Users</span>
        </div>
      </div>

      {/* Main Tabs / Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Problem statements, Rules, Overview */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>About The Hackathon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {hackathon.description}
              </p>
            </CardContent>
          </Card>

          {/* Problem Statements */}
          {hackathon.problemStatements && (
            <Card>
              <CardHeader>
                <CardTitle icon={Terminal}>Problem Statements & Challenges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hackathon.problemStatements.map((prob) => (
                  <div key={prob.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-400" />
                      {prob.title}
                    </h4>
                    <p className="text-xs text-slate-400 pl-4">{prob.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Prizes */}
          {hackathon.prizes && (
            <Card>
              <CardHeader>
                <CardTitle icon={Award}>Prizes & Recognition</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {hackathon.prizes.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <span className="text-2xl">{p.badge}</span>
                    <h4 className="font-semibold text-slate-200 text-xs">{p.place}</h4>
                    <span className="text-emerald-400 font-bold text-sm block">{p.reward}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Timeline & Requirements */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle icon={Clock}>Event Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hackathon.timeline.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className={`mt-0.5 h-3 w-3 rounded-full shrink-0 ${step.status === 'completed' ? 'bg-emerald-400' : step.status === 'current' ? 'bg-indigo-400 animate-ping' : 'bg-slate-700'}`} />
                  <div>
                    <span className="font-semibold text-slate-200 block">{step.step}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{step.date}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle icon={Code2}>Allowed Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {hackathon.technologies.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
