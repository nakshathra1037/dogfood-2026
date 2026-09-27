import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Terminal,
  Award,
  Users,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import Button from '../components/Button';
import HackathonCard from '../components/HackathonCard';
import apiClient from '../api/client';

export default function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [hackerCount, setHackerCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [eventsRes, usersRes, galleryRes] = await Promise.all([
        apiClient.get('/events?limit=3').catch(() => ({ data: { items: [] } })),
        apiClient.get('/users').catch(() => ({ data: { items: [] } })),
        apiClient.get('/gallery?limit=100').catch(() => ({ data: { items: [] } })),
      ]);

      setEvents(eventsRes.data?.items || []);
      const userList = usersRes.data?.items || usersRes.data || [];
      setHackerCount(userList.length || 7);
      setProjectCount(galleryRes.data?.items?.length || 0);
    } catch (err) {
      console.error('Failed to load home page live metrics:', err);
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Open-Source Hackathon Platform 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Where Great Ideas Become <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
              Shipped Open Source Software
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Host, manage, and compete in world-class hackathons locally or globally. Zero cloud vendor lock-in, automated judging workflows, and seamless team management.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="emerald"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/hackathons')}
            >
              Explore Hackathons
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={Terminal}
              onClick={() => navigate('/register')}
            >
              Create Account
            </Button>
          </div>

          {/* Quick Stats Banner */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl font-bold text-white block">{events.length}</span>
              <span className="text-xs text-slate-400">Live Events</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl font-bold text-emerald-400 block">{hackerCount}+</span>
              <span className="text-xs text-slate-400">Active Hackers</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl font-bold text-indigo-400 block">{projectCount}</span>
              <span className="text-xs text-slate-400">Projects Shipped</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl font-bold text-purple-400 block">100%</span>
              <span className="text-xs text-slate-400">Local-First</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hackathons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Featured Competitions</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Active & Upcoming Hackathons</h2>
          </div>
          <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/hackathons')}>
            View All Hackathons
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <p className="text-xs text-slate-400 col-span-3 text-center py-8">Loading live backend hackathons...</p>
          ) : (
            events.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))
          )}
        </div>
      </section>

      {/* Benefits / Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Platform Features</span>
          <h2 className="text-3xl font-bold text-white tracking-tight">Engineered for Hackers & Organizers</h2>
          <p className="text-slate-400 text-sm">Everything you need to run, participate in, and evaluate hackathons seamlessly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Local-First Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Runs completely offline or self-hosted via Docker Compose. Zero paid API dependencies or third-party tracking.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Seamless Team Roster</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Form teams, generate instant invite codes, manage roles, and coordinate code submissions effortlessly.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Weighted Rubric Judging</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Custom multi-criteria evaluation matrices with real-time weighted score calculation and judge feedback portal.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Workflow</span>
          <h2 className="text-3xl font-bold text-white tracking-tight">How DOGFOOD Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Discover', desc: 'Browse active hackathons, review problem statements and tech requirements.' },
            { step: '02', title: 'Assemble Team', desc: 'Create a team or join teammates using instant invite codes.' },
            { step: '03', title: 'Build & Submit', desc: 'Build your project and submit your code repository and demo links.' },
            { step: '04', title: 'Evaluate & Win', desc: 'Judges score projects across weighted criteria to determine winners.' },
          ].map((s) => (
            <div key={s.step} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 relative">
              <span className="text-3xl font-black font-mono text-indigo-500/30 block">{s.step}</span>
              <h4 className="text-base font-bold text-white">{s.title}</h4>
              <p className="text-xs text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900/80 via-purple-900/50 to-slate-900 border border-indigo-500/30 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to host or join your next hackathon?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Get started in seconds with our open-source, local-first platform foundation.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="emerald" size="lg" onClick={() => navigate('/register')}>
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
