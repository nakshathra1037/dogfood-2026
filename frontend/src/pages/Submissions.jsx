import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Plus, Filter, Search } from 'lucide-react';
import { submissionService } from '../services/submissionService';
import { useToast } from '../context/ToastContext';
import SubmissionCard from '../components/SubmissionCard';
import Button from '../components/Button';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await submissionService.getSubmissions();
      setSubmissions(res.data || []);
    } catch (err) {
      error(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleDelete = async (sub) => {
    if (window.confirm(`Delete submission "${sub.projectName}"?`)) {
      try {
        await submissionService.deleteSubmission(sub.id);
        success('Submission deleted');
        fetchSubmissions();
      } catch (err) {
        error(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-400" />
            My Project Submissions
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Track draft and submitted projects, review feedback, and edit code repository URLs.
          </p>
        </div>

        <Button variant="emerald" icon={Plus} onClick={() => navigate('/dashboard/submissions/new')}>
          Create Submission
        </Button>
      </div>

      {loading ? (
        <Loader fullPage message="Loading submissions..." />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Project Submissions Yet"
          description="You haven't submitted any projects yet. Create a submission before the deadline."
          actionLabel="Create Submission"
          onAction={() => navigate('/dashboard/submissions/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map((sub) => (
            <SubmissionCard
              key={sub.id}
              submission={sub}
              onDelete={handleDelete}
              onEdit={() => navigate(`/dashboard/submissions/edit/${sub.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
