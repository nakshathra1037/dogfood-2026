import React, { useState, useEffect } from 'react';
import { Users, Mail } from 'lucide-react';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/client';

export default function ManageParticipants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success } = useToast();

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users?limit=100');
      const usersList = res.data?.items || res.data || [];
      const formatted = usersList.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'PARTICIPANT',
        team: 'DOGFOOD Roster',
        registeredAt: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2026-09-27',
      }));
      setParticipants(formatted);
    } catch (err) {
      console.error('Failed to fetch participants list:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Participant Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-100 block">{row.name}</span>
          <span className="text-[11px] text-slate-400">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Roster / Group',
      key: 'team',
      render: (row) => <span className="font-mono text-indigo-300">{row.team}</span>,
    },
    {
      header: 'Role',
      key: 'role',
      render: (row) => <Badge variant={row.role === 'JUDGE' || row.role === 'Judge' ? 'purple' : 'info'}>{row.role}</Badge>,
    },
    {
      header: 'Registered Date',
      key: 'registeredAt',
      sortable: true,
      render: (row) => <span className="font-mono text-slate-400 text-xs">{row.registeredAt}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Fetching live participants directory..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" />
          Manage Participants & Roster
        </h1>
        <p className="text-slate-400 text-xs mt-1">Directory of registered hackers and assigned judges fetched from live backend database.</p>
      </div>

      <DataTable
        columns={columns}
        data={participants}
        searchPlaceholder="Search participants by name or email..."
        searchField="name"
        actions={(row) => (
          <Button variant="ghost" size="sm" icon={Mail} onClick={() => success(`Contact email initialized for ${row.name}`)}>
            Contact
          </Button>
        )}
      />
    </div>
  );
}
