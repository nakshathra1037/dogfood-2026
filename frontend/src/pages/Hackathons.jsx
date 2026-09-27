import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Grid, List, Sparkles } from 'lucide-react';
import { hackathonService } from '../services/hackathonService';
import HackathonCard from '../components/HackathonCard';
import Input from '../components/Input';
import Select from '../components/Select';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const fetchHackathons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await hackathonService.getHackathons({
        search,
        status: statusFilter,
        category: categoryFilter,
        mode: modeFilter,
      });
      let list = res.data || [];

      // Client sort
      if (sortBy === 'prize') {
        list.sort((a, b) => b.prizePool.localeCompare(a.prizePool));
      } else if (sortBy === 'participants') {
        list.sort((a, b) => b.participantsCount - a.participantsCount);
      }
      setHackathons(list);
    } catch (err) {
      setError(err.message || 'Failed to load hackathons list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [search, statusFilter, categoryFilter, modeFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-indigo-400" />
          Explore Hackathons
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Discover active, upcoming, and past tech challenges. Register your team and submit projects.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            icon={Search}
            placeholder="Search hackathons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={['All', 'Active', 'Upcoming', 'Ended']}
          />

          <Select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={['All', 'Artificial Intelligence', 'Cybersecurity', 'Sustainability']}
          />

          <Select
            label="Mode"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            options={['All', 'Online', 'Hybrid', 'Offline']}
          />

          <Select
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'prize', label: 'Highest Prize' },
              { value: 'participants', label: 'Most Participants' },
            ]}
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <Loader fullPage message="Fetching hackathons list..." />
      ) : error ? (
        <ErrorState description={error} onRetry={fetchHackathons} />
      ) : hackathons.length === 0 ? (
        <EmptyState
          title="No Hackathons Found"
          description="Try adjusting your search criteria or clear active filters."
        />
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
