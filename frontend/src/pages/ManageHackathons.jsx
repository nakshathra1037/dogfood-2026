import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, PlusCircle, RefreshCw, Eye } from 'lucide-react';
import { hackathonService } from '../services/hackathonService';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function ManageHackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const res = await hackathonService.getHackathons();
      setHackathons(res.data || []);
    } catch (err) {
      error(err.userMessage || 'Failed to load hackathons');
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

  const columns = [
    {
      header: 'Hackathon Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-100 block">{row.name || row.title}</span>
          <span className="text-[11px] text-slate-400 line-clamp-1">{row.description || 'No description'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        const s = (row.status || 'ACTIVE').toUpperCase();
        return (
          <Badge variant={s === 'ACTIVE' ? 'success' : s === 'DRAFT' ? 'warning' : 'neutral'}>
            {s}
          </Badge>
        );
      },
    },
    {
      header: 'Start Date',
      key: 'start_date',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {formatDate(row.start_date || row.startDate)}
        </span>
      ),
    },
    {
      header: 'End Date',
      key: 'end_date',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {formatDate(row.end_date || row.endDate)}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Loading organizer hackathons..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-purple-400" />
            Manage Hackathon Competitions
          </h1>
          <p className="text-slate-400 text-xs mt-1">Control table for published and draft hackathons.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchHackathons}>
            Refresh
          </Button>
          <Button variant="emerald" icon={PlusCircle} onClick={() => navigate('/organizer/create-hackathon')}>
            Create Hackathon
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={hackathons}
        searchPlaceholder="Search hackathons..."
        searchField="name"
        actions={(row) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={Eye}
              onClick={() => navigate(`/hackathons/${row.id}`)}
            >
              View
            </Button>
          </div>
        )}
      />
    </div>
  );
}
