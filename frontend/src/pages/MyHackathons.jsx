import React from 'react';
import { FolderGit2 } from 'lucide-react';
import HackathonCard from '../components/HackathonCard';
import { mockHackathons } from '../data/mockHackathons';

export default function MyHackathons() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockHackathons.slice(0, 2).map((h) => (
          <HackathonCard key={h.id} hackathon={h} />
        ))}
      </div>
    </div>
  );
}
