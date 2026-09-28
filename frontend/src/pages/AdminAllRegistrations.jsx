import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Users,
  Search,
  RefreshCw,
  FolderGit2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { eventsApi } from '../api/events';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import { Card, CardContent } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function AdminAllRegistrations() {
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAllRegistrations = async () => {
    setLoading(true);
    try {
      const eventsRes = await eventsApi.getEvents({ limit: 100 });
      const eventsList = eventsRes.items || eventsRes || [];
      setEvents(eventsList);

      const allRegs = [];
      await Promise.all(
        eventsList.map(async (ev) => {
          try {
            const regs = await eventsApi.getEventRegistrations(ev.id);
            if (Array.isArray(regs)) {
              regs.forEach((r) => {
                allRegs.push({
                  ...r,
                  eventId: ev.id,
                  eventName: ev.name || ev.title,
                });
              });
            }
          } catch {
            // ignore
          }
        })
      );

      setRegistrations(allRegs);
    } catch (err) {
      toastError('Failed to load registrations from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllRegistrations();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filtered = registrations.filter((r) => {
    const matchesEvent =
      selectedEventId === 'All' || String(r.eventId) === String(selectedEventId);

    const matchesSearch =
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.eventName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.team_name || '').toLowerCase().includes(search.toLowerCase());

    return matchesEvent && matchesSearch;
  });

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner message="Fetching all platform registrations from database..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-purple-400" />
            Platform Registrations Overview
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Global view of all registered participants and squad entries across all hackathons.
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadAllRegistrations}>
          Refresh
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by participant name, email, team, or hackathon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 max-w-xs"
        >
          <option value="All">All Hackathons ({events.length})</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name || ev.title}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="border-slate-800 overflow-hidden shadow-xl">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No registrations found in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Participant</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Hackathon</th>
                    <th className="p-4">Team / Squad</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((r, idx) => (
                    <tr key={`${r.id}-${idx}`} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-semibold text-white">
                        {r.name}
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        {r.email}
                      </td>
                      <td className="p-4 font-medium text-purple-300">
                        {r.eventName}
                      </td>
                      <td className="p-4 text-slate-200">
                        {r.team_name || 'Solo'}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={r.role === 'LEADER' ? 'purple' : 'neutral'}
                          className="text-[10px]"
                        >
                          {r.role}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="p-4">
                        <Badge variant="emerald" className="text-[10px] flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          {r.status || 'Registered'}
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
