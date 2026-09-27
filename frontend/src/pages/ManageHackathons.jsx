import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { hackathonService } from '../services/hackathonService';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';

export default function ManageHackathons() {
  const [hackathons, setHackathons] = useState([]);
  const navigate = useNavigate();
  const { success } = useToast();

  useEffect(() => {
    hackathonService.getHackathons().then((res) => setHackathons(res.data || []));
  }, []);

  const columns = [
    {
      header: 'Hackathon Title',
      key: 'title',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-100 block">{row.title}</span>
          <span className="text-[11px] text-slate-400">{row.organizer}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      render: (row) => <Badge variant="indigo">{row.category}</Badge>,
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'neutral'}>{row.status}</Badge>,
    },
    {
      header: 'Prize Pool',
      key: 'prizePool',
      render: (row) => <span className="font-mono text-emerald-400 font-semibold">{row.prizePool}</span>,
    },
    {
      header: 'Participants',
      key: 'participantsCount',
      sortable: true,
      render: (row) => <span className="font-mono text-slate-300">{row.participantsCount} Hackers</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-purple-400" />
            Manage Hackathon Competitions
          </h1>
          <p className="text-slate-400 text-xs mt-1">Admin control table for published and upcoming hackathons.</p>
        </div>

        <Button variant="emerald" icon={PlusCircle} onClick={() => navigate('/organizer/create-hackathon')}>
          Create Hackathon
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={hackathons}
        searchPlaceholder="Search hackathons by title..."
        searchField="title"
        actions={(row) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" icon={Edit} onClick={() => success(`Edit mode for ${row.title}`)} />
            <Button variant="ghost" size="sm" icon={Trash2} className="text-rose-400" onClick={() => success(`Deleted ${row.title}`)} />
          </div>
        )}
      />
    </div>
  );
}
