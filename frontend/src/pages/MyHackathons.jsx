import React, { useState, useEffect } from 'react';
import { FolderGit2 } from 'lucide-react';
import HackathonCard from '../components/HackathonCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import apiClient from '../api/client';

export default function MyHackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/events?limit=20')
      .then((res) => {
        setHackathons(res.data?.items || []);
      })
      .catch((err) => console.error('Failed to fetch my registered hackathons:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Fetching registered hackathons..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FolderGit2 className="w-6 h-6 text-indigo-400" />
          My Registered Hackathons
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Competitions you are registered for and currently participating in.
        </p>
      </div>

      {hackathons.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <p className="text-slate-300 text-sm font-semibold">No registered hackathons found.</p>
          <p className="text-slate-400 text-xs">Explore public hackathons and register your team!</p>
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
