import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  Scale,
  CheckCircle2,
  Clock,
  ExternalLink,
  Code2,
  Save,
  Send,
  AlertCircle,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

export function JudgeDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [myEvaluations, setMyEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scoring Modal state
  const [activeProject, setActiveProject] = useState(null);
  const [activeRubric, setActiveRubric] = useState(null);
  const [scoresMap, setScoresMap] = useState({}); // { [criterionId]: { score: 8, comment: '' } }
  const [evalNotes, setEvalNotes] = useState('');
  const [savingEval, setSavingEval] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  useEffect(() => {
    loadJudgeData();
  }, []);

  const loadJudgeData = async () => {
    setLoading(true);
    try {
      const [assignRes, evalRes] = await Promise.all([
        apiClient.get('/judges/me/assignments'),
        apiClient.get('/evaluations/judge/me'),
      ]);
      setAssignments(assignRes.data || []);
      setMyEvaluations(evalRes.data || []);
    } catch (err) {
      console.error('Failed to load judge assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEvaluationModal = async (project) => {
    setActiveProject(project);
    setModalError('');
    setModalSuccess('');
    setSavingEval(true);

    try {
      // 1. Fetch active rubric for the project's event
      const rubRes = await apiClient.get(`/events/${project.event_id}/rubrics/active`);
      const rubric = rubRes.data;
      setActiveRubric(rubric);

      // 2. Check if an evaluation already exists for this project
      const existingEval = myEvaluations.find((e) => e.project_id === project.id);
      const initialScores = {};

      if (existingEval && existingEval.scores) {
        setEvalNotes(existingEval.notes || '');
        existingEval.scores.forEach((s) => {
          initialScores[s.criterion_id] = {
            score: s.score,
            comment: s.comment || '',
          };
        });
      } else {
        // Default initialized to 7.0 for each criterion
        setEvalNotes('');
        rubric.criteria?.forEach((c) => {
          initialScores[c.id] = {
            score: Math.min(8.0, c.max_score),
            comment: '',
          };
        });
      }

      setScoresMap(initialScores);
    } catch (err) {
      setModalError(err.userMessage || 'Failed to load evaluation rubric.');
    } finally {
      setSavingEval(false);
    }
  };

  const handleScoreChange = (criterionId, val) => {
    const num = parseFloat(val) || 0;
    setScoresMap((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        score: num,
      },
    }));
  };

  const handleCommentChange = (criterionId, val) => {
    setScoresMap((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        comment: val,
      },
    }));
  };

  const handleSaveEvaluation = async (isDraft) => {
    if (!activeProject || !activeRubric) return;
    setSavingEval(true);
    setModalError('');
    setModalSuccess('');

    try {
      const scoresPayload = Object.entries(scoresMap).map(([critId, data]) => ({
        criterion_id: parseInt(critId, 10),
        score: data.score,
        comment: data.comment || null,
      }));

      await apiClient.post('/evaluations', {
        project_id: activeProject.id,
        rubric_id: activeRubric.id,
        scores: scoresPayload,
        notes: evalNotes.trim() || null,
        is_draft: isDraft,
      });

      setModalSuccess(isDraft ? 'Draft evaluation saved!' : 'Evaluation submitted successfully!');
      await loadJudgeData();
      if (!isDraft) {
        setTimeout(() => setActiveProject(null), 1200);
      }
    } catch (err) {
      setModalError(err.userMessage || 'Failed to submit evaluation.');
    } finally {
      setSavingEval(false);
    }
  };

  const completedCount = assignments.filter((a) =>
    myEvaluations.some((e) => e.project_id === a.project_id && e.status === 'SUBMITTED')
  ).length;

  const totalCount = assignments.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Judge Evaluation Portal
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Review assigned hackathon projects, grade against weighted rubrics, and submit authoritative scores.
          </p>
        </div>

        {/* Progress Card */}
        <div className="flex items-center space-x-4 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl shadow">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Judging Progress</div>
            <div className="text-base font-extrabold text-white">
              {completedCount} / {totalCount} Completed ({progressPct}%)
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400">
            {progressPct}%
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your assigned projects..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No projects currently assigned"
          description="Hackathon organizers will assign submitted projects for your review once the submission window closes."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a) => {
            const proj = a.project;
            if (!proj) return null;

            const existingEval = myEvaluations.find((e) => e.project_id === proj.id);
            const isSubmitted = existingEval?.status === 'SUBMITTED';

            return (
              <div
                key={a.id}
                className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between shadow-lg hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {proj.track ? (
                      <Badge variant="primary">{proj.track.name}</Badge>
                    ) : (
                      <Badge variant="default">General Track</Badge>
                    )}

                    {isSubmitted ? (
                      <Badge variant="success">EVALUATED</Badge>
                    ) : (
                      <Badge variant="warning">PENDING REVIEW</Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{proj.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {proj.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-4">
                    <span className="font-medium text-slate-300">
                      Team: {proj.team?.name || 'Assigned Team'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex space-x-2">
                    {proj.repository_url && (
                      <a
                        href={proj.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Repository"
                      >
                        <Code2 className="w-4 h-4" />
                      </a>
                    )}
                    {proj.demo_url && (
                      <a
                        href={proj.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => openEvaluationModal(proj)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow ${
                      isSubmitted
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    }`}
                  >
                    <span>{isSubmitted ? 'View / Update Scores' : 'Evaluate Project'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Evaluation & Scoring Modal */}
      <Modal
        isOpen={Boolean(activeProject)}
        onClose={() => setActiveProject(null)}
        title={`Evaluation: ${activeProject?.name || ''}`}
        maxWidth="max-w-3xl"
      >
        {activeProject && (
          <div className="space-y-6">
            {modalError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {modalError}
              </div>
            )}
            {modalSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                {modalSuccess}
              </div>
            )}

            {/* Rubric Criteria Form */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official Rubric Scoring Criteria
              </h4>

              {activeRubric?.criteria?.map((c) => {
                const curScore = scoresMap[c.id]?.score ?? 0;
                const curComment = scoresMap[c.id]?.comment ?? '';

                return (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="text-sm font-bold text-white">{c.name}</h5>
                          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {c.weight}% Weight
                          </span>
                        </div>
                        {c.description && (
                          <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>
                        )}
                      </div>

                      {/* Numeric Score Input */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max={c.max_score}
                          step="0.5"
                          value={curScore}
                          onChange={(e) => handleScoreChange(c.id, e.target.value)}
                          className="w-20 px-2.5 py-1.5 text-sm font-mono font-bold rounded-lg bg-slate-900 border border-slate-800 text-right text-emerald-400 focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-xs text-slate-500 font-semibold">/ {c.max_score} pts</span>
                      </div>
                    </div>

                    {/* Score Slider */}
                    <input
                      type="range"
                      min="0"
                      max={c.max_score}
                      step="0.5"
                      value={curScore}
                      onChange={(e) => handleScoreChange(c.id, e.target.value)}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />

                    {/* Qualitative feedback comment */}
                    <input
                      type="text"
                      placeholder="Optional criterion comments or qualitative feedback..."
                      value={curComment}
                      onChange={(e) => handleCommentChange(c.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                );
              })}
            </div>

            {/* Overall Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Overall Evaluation Summary & Feedback
              </label>
              <textarea
                rows={3}
                placeholder="Key strengths, architectural highlights, suggestions for improvement..."
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={savingEval}
                onClick={() => handleSaveEvaluation(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                disabled={savingEval}
                onClick={() => handleSaveEvaluation(false)}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Final Evaluation</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
