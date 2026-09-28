import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Mail, Shield, Calendar } from 'lucide-react';
import { usersApi } from '../api/users';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import { Card, CardContent } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function AdminParticipants() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const { error: toastError } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getUsers({ limit: 100 });
      const list = res.items || res || [];
      setUsers(list);
    } catch (err) {
      toastError('Failed to load participants from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'All' ||
      (u.role || '').toUpperCase() === roleFilter.toUpperCase();

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner message="Fetching user accounts from database..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Registered Platform Participants
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Accounts registered in the platform database with roles and authentication status.
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadUsers}>
          Refresh
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search participants by name or email..."
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
          <option value="PARTICIPANT">Participants</option>
          <option value="ORGANIZER">Organizers</option>
          <option value="ADMIN">Admins</option>
          <option value="JUDGE">Judges</option>
        </select>
      </div>

      <Card className="border-slate-800 overflow-hidden shadow-xl">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No participants found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4">Active Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-semibold text-white">
                        {u.name || `User #${u.id}`}
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        {u.email}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            u.role === 'ADMIN'
                              ? 'purple'
                              : u.role === 'ORGANIZER'
                              ? 'indigo'
                              : 'neutral'
                          }
                          className="text-[10px]"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="p-4">
                        <Badge variant="emerald" className="text-[10px]">
                          Active
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
