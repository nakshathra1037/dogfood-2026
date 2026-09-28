import React, { useState, useEffect } from 'react';
import { Search, Sparkles, RefreshCw } from 'lucide-react';
import { hackathonService } from '../services/hackathonService';
import { useAuth } from '../context/AuthContext';
import HackathonCard from '../components/HackathonCard';
import Input from '../components/Input';
import Select from '../components/Select';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';

export default function Hackathons() {
  const { isAuthenticated } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const fetchHackathons = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all hackathons from backend
      const res = await hackathonService.getHackathons({
        search,
        status: statusFilter,
      });
      let list = res.data || [];

      // 2. Fetch registered events for the current user if authenticated
      if (isAuthenticated) {
        try {
          const regRes = await hackathonService.getMyRegisteredHackathons();
          const regList = regRes.data || [];
          const regSet = new Set(regList.map((e) => e.id));
          setRegisteredIds(regSet);
        } catch {
          // Keep empty set on error
        }
      }

      // Sort
      if (sortBy === 'newest') {
        list.sort((a, b) => new Date(b.created_at || b.start_date || 0) - new Date(a.created_at || a.start_date || 0));
      } else if (sortBy === 'start_soon') {
        list.sort((a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0));
      }

      setHackathons(list);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.userMessage || err.message || 'Failed to load hackathons from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [search, statusFilter, sortBy, isAuthenticated]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-indigo-400" />
            Explore Hackathons
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover active competitions, participate solo or form a team, and build projects.
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchHackathons}>
          Refresh List
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            icon={Search}
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={['All', 'ACTIVE', 'DRAFT', 'ENDED']}
          />

          <Select
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'newest', label: 'Recently Created' },
              { value: 'start_soon', label: 'Starting Soon' },
            ]}
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <Loader fullPage message="Loading hackathons..." />
      ) : error ? (
        <ErrorState title="Unable to load hackathons." description={error} onRetry={fetchHackathons} />
      ) : hackathons.length === 0 ? (
        <EmptyState
          title="No hackathons available right now."
          description="There are currently no published hackathons matching your search. Check back soon!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((h) => (
            <HackathonCard
              key={h.id}
              hackathon={h}
              isRegistered={registeredIds.has(h.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
