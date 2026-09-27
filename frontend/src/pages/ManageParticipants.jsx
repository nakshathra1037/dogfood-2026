import React, { useState } from 'react';
import { Users, Mail, Shield, UserCheck } from 'lucide-react';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';

const mockParticipantsList = [
  { id: 'p1', name: 'Alex Chen', email: 'alex.chen@example.com', team: 'NeuralBytes', role: 'Participant', registeredAt: '2026-09-20' },
  { id: 'p2', name: 'Priya Sharma', email: 'priya@example.com', team: 'NeuralBytes', role: 'Participant', registeredAt: '2026-09-21' },
  { id: 'p3', name: 'David Kim', email: 'david@example.com', team: 'NeuralBytes', role: 'Participant', registeredAt: '2026-09-22' },
  { id: 'p4', name: 'Sarah Jenkins', email: 'sarah@example.com', team: 'CyberDefenders', role: 'Judge', registeredAt: '2026-09-18' },
  { id: 'p5', name: 'Marcus Ray', email: 'marcus@example.com', team: 'CyberDefenders', role: 'Participant', registeredAt: '2026-09-23' },
];

export default function ManageParticipants() {
  const [participants, setParticipants] = useState(mockParticipantsList);
  const { success } = useToast();

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
      header: 'Team Name',
      key: 'team',
      render: (row) => <span className="font-mono text-indigo-300">{row.team}</span>,
    },
    {
      header: 'Role',
      key: 'role',
      render: (row) => <Badge variant={row.role === 'Judge' ? 'purple' : 'info'}>{row.role}</Badge>,
    },
    {
      header: 'Registered Date',
      key: 'registeredAt',
      sortable: true,
      render: (row) => <span className="font-mono text-slate-400 text-xs">{row.registeredAt}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" />
          Manage Participants & Roster
        </h1>
        <p className="text-slate-400 text-xs mt-1">Directory of registered hackers and assigned judges across competitions.</p>
      </div>

      <DataTable
        columns={columns}
        data={participants}
        searchPlaceholder="Search participants by name or email..."
        searchField="name"
        actions={(row) => (
          <Button variant="ghost" size="sm" icon={Mail} onClick={() => success(`Emailed ${row.name}`)}>
            Contact
          </Button>
        )}
      />
    </div>
  );
}
