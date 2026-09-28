import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import HackathonCard from '../components/HackathonCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Button from '../components/Button';
import apiClient from '../api/client';

export default function MyHackathons() {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRegisteredHackathons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/events/registered');
      setHackathons(res.data?.items || []);
    } catch (err) {
      console.error('Failed to fetch my registered hackathons:', err);
      setError(err.userMessage || 'Failed to load your registered hackathons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisteredHackathons();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Fetching your registered hackathons from backend..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-indigo-400" />
            My Registered Hackathons
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Competitions you are registered for and currently participating in.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchRegisteredHackathons}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" icon={Sparkles} onClick={() => navigate('/hackathons')}>
            Explore Hackathons
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-center space-y-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-rose-300 text-sm font-semibold">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchRegisteredHackathons}>
            Retry
          </Button>
        </div>
      ) : hackathons.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-slate-200 text-sm font-semibold">No registered hackathons found</p>
            <p className="text-slate-400 text-xs">
              You haven't registered for any hackathons yet. Browse upcoming competitions and join with your team!
            </p>
          </div>
          <Button variant="emerald" size="sm" icon={Sparkles} onClick={() => navigate('/hackathons')}>
            Browse Active Competitions
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((h) => (
            <HackathonCard key={h.id} hackathon={h} />
          ))}
        </div>
      )}
    </div>
  );
}
