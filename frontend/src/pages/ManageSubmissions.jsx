import React, { useState, useEffect } from 'react';
import { Award, Eye, Sliders, CheckCircle } from 'lucide-react';
import { submissionService } from '../services/submissionService';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';

export default function ManageSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const { success } = useToast();

  useEffect(() => {
    submissionService.getSubmissions().then((res) => setSubmissions(res.data || []));
  }, []);

  const columns = [
    {
      header: 'Project Name',
      key: 'projectName',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-100 block">{row.projectName}</span>
          <span className="text-[11px] text-slate-400">Team: {row.teamName}</span>
        </div>
      ),
    },
    {
      header: 'Competition',
      key: 'hackathonTitle',
      render: (row) => <span className="text-xs text-slate-300">{row.hackathonTitle}</span>,
    },
    {
      header: 'Submission Status',
      key: 'status',
      render: (row) => <Badge variant={row.status === 'Submitted' ? 'success' : 'warning'}>{row.status}</Badge>,
    },
    {
      header: 'Score',
      key: 'score',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-emerald-400 font-semibold">{row.score !== null ? `${row.score} pts` : 'Unrated'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-400" />
          Manage Project Submissions
        </h1>
        <p className="text-slate-400 text-xs mt-1">Review submitted projects and verify code repositories.</p>
      </div>

      <DataTable
        columns={columns}
        data={submissions}
        searchPlaceholder="Search project submissions..."
        searchField="projectName"
        actions={(row) => (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={Eye} onClick={() => success(`Inspecting ${row.projectName}`)}>
              Review
            </Button>
          </div>
        )}
      />
    </div>
  );
}
