import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  Search,
  ArrowLeft,
  RefreshCw,
  Mail,
  Calendar,
  Shield,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { eventsApi } from '../api/events';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function AdminEventRegistrations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const [evData, regsData] = await Promise.all([
        eventsApi.getEventById(id),
        eventsApi.getEventRegistrations(id),
      ]);
      setEvent(evData);
      setRegistrations(Array.isArray(regsData) ? regsData : []);
    } catch (err) {
      console.error('Failed to load event registrations:', err);
      toastError('Failed to load registration records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      (reg.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (reg.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (reg.team_name || '').toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'All' ||
      (reg.role || '').toUpperCase() === roleFilter.toUpperCase();

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner message="Fetching registrations from database..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        icon={ArrowLeft}
        onClick={() => navigate('/admin/hackathons')}
      >
        Back to Hackathons
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Registrations for {event?.name || `Hackathon #${id}`}
            </h1>
            <Badge variant="indigo">{registrations.length} Total Registrations</Badge>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Real participant entries and team affiliations stored in the database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadRegistrations}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by participant name, email, or team name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
        >
          <option value="All">All Roles</option>
          <option value="LEADER">Team Leaders</option>
          <option value="MEMBER">Team Members</option>
        </select>
      </div>

      {/* Registrations List Table */}
      <Card className="border-slate-800 overflow-hidden shadow-xl">
        <CardContent className="p-0">
          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">No registrations found</p>
              <p className="text-xs text-slate-400">
                {registrations.length === 0
                  ? 'No participants have registered for this hackathon yet.'
                  : 'No registrations match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Participant</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Team / Roster</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Registration Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-semibold text-white">
                        {reg.name}
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        {reg.email}
                      </td>
                      <td className="p-4 text-purple-300 font-medium">
                        {reg.team_name || 'Solo'}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={reg.role === 'LEADER' ? 'purple' : 'neutral'}
                          className="text-[10px]"
                        >
                          {reg.role}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {formatDate(reg.created_at)}
                      </td>
                      <td className="p-4">
                        <Badge variant="emerald" className="text-[10px] flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          {reg.status || 'Registered'}
                        </Badge>
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
