import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  PlusCircle,
  RefreshCw,
  Eye,
  Edit,
  Search,
  CheckCircle2,
  Calendar,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { eventsApi } from '../api/events';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import { Card, CardContent } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function AdminManageHackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const fetchHackathons = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await eventsApi.getEvents({ limit: 100 });
      const items = res.items || res || [];

      // Enrich with live registration counts
      const enriched = await Promise.all(
        items.map(async (ev) => {
          try {
            const regs = await eventsApi.getEventRegistrations(ev.id);
            return {
              ...ev,
              registrationCount: Array.isArray(regs) ? regs.length : 0,
            };
          } catch {
            return { ...ev, registrationCount: 0 };
          }
        })
      );
      setHackathons(enriched);
    } catch (err) {
      const msg = err.userMessage || 'Unable to load hackathons.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const togglePublish = async (ev) => {
    const newStatus = ev.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      await eventsApi.updateEvent(ev.id, { status: newStatus });
      success(`Updated "${ev.name}" status to ${newStatus === 'ACTIVE' ? 'Published' : 'Draft'}.`);
      fetchHackathons();
    } catch (err) {
      toastError(err.userMessage || 'Failed to update status.');
    }
  };

  const filtered = hackathons.filter((h) => {
    const matchesSearch =
      (h.name || h.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (h.description || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      (h.status || '').toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner message="Loading hackathons..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 rounded-2xl glass-panel border border-rose-500/30 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-semibold text-white">Unable to load hackathons.</h3>
        <p className="text-xs text-slate-400">{errorMessage}</p>
        <Button variant="primary" icon={RefreshCw} onClick={fetchHackathons}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Admin Portal</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400">Explore Hackathons</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            <FolderGit2 className="w-6 h-6 text-purple-400" />
            Explore Hackathons
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Create, edit, publish competitions and manage real database hackathon records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchHackathons}>
            Refresh
          </Button>
          <Button
            variant="emerald"
            icon={PlusCircle}
            onClick={() => navigate('/admin/hackathons/create')}
          >
            + Create Hackathon
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search hackathons by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
        >
          <option value="All">All Statuses</option>
          <option value="ACTIVE">Published / Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ENDED">Ended</option>
        </select>
      </div>

      {/* Table */}
      <Card className="border-slate-800 overflow-hidden shadow-xl">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <p className="text-base font-medium text-slate-200">No hackathons created yet.</p>
                <p className="text-xs text-slate-400 mt-1">Click the button below to publish your first hackathon to the database.</p>
              </div>
              <Button
                variant="emerald"
                icon={PlusCircle}
                onClick={() => navigate('/admin/hackathons/create')}
              >
                + Create Hackathon
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Hackathon Name</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Start Date</th>
                    <th className="p-4">End Date</th>
                    <th className="p-4 text-center">Registrations</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <span className="font-semibold text-white block text-sm">
                          {ev.name || ev.title}
                        </span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">
                          {ev.description || 'No description'}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            ev.status === 'ACTIVE'
                              ? 'success'
                              : ev.status === 'DRAFT'
                              ? 'warning'
                              : 'neutral'
                          }
                          pulse={ev.status === 'ACTIVE'}
                        >
                          {ev.status === 'ACTIVE' ? 'Published' : ev.status || 'Draft'}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        {formatDate(ev.start_date)}
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        {formatDate(ev.end_date)}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
                          <Users className="w-3.5 h-3.5" />
                          {ev.registrationCount}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            onClick={() => navigate(`/admin/hackathons/${ev.id}/registrations`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => navigate(`/admin/edit-hackathon/${ev.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePublish(ev)}
                            className={ev.status === 'ACTIVE' ? 'text-amber-400' : 'text-emerald-400'}
                          >
                            {ev.status === 'ACTIVE' ? 'Unpublish' : 'Publish'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
