import React, { useState } from 'react';
import {
  Award,
  Sliders,
  CheckCircle,
  HelpCircle,
  FolderGit2,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const availableSubmissions = [
  { id: 'sub-1', title: 'EchoMesh Local AI', category: 'AI & Infra', team: 'Team NeuralBytes' },
  { id: 'sub-2', title: 'ZeroVault KV', category: 'Systems', team: 'Alex Vance' },
  { id: 'sub-3', title: 'FlowState UI', category: 'Developer Tools', team: 'Team Canvas' },
];

const initialCriteria = [
  { id: 'c1', name: 'Technical Complexity', weight: 0.3, max: 10, score: 9, description: 'Depth of technical architecture and implementation rigor' },
  { id: 'c2', name: 'Originality & Innovation', weight: 0.25, max: 10, score: 8, description: 'Novelty of concept and uniqueness of solution approach' },
  { id: 'c3', name: 'User Experience & UI', weight: 0.25, max: 10, score: 9, description: 'Intuitive interface design, responsiveness, and polished UX' },
  { id: 'c4', name: 'Practical Utility', weight: 0.2, max: 10, score: 9, description: 'Real-world applicability and value to target audience' },
];

export default function JudgingPage() {
  const [selectedSubId, setSelectedSubId] = useState('sub-1');
  const [scores, setScores] = useState(
    initialCriteria.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.score }), {})
  );
  const [feedback, setFeedback] = useState(
    'Outstanding local implementation. Clean separation of concerns and flawless execution of mesh networking.'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentSub = availableSubmissions.find((s) => s.id === selectedSubId);

  const handleScoreChange = (id, val) => {
    const parsed = Math.min(10, Math.max(0, parseFloat(val) || 0));
    setScores((prev) => ({ ...prev, [id]: parsed }));
  };

  // Calculate Weighted Total Score (0 - 100)
  const calculateTotal = () => {
    let totalWeighted = 0;
    initialCriteria.forEach((c) => {
      const s = scores[c.id] || 0;
      totalWeighted += (s / c.max) * c.weight * 100;
    });
    return totalWeighted.toFixed(1);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-400" />
            Judging & Scoring Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Grade project entries against weighted rubrics and submit local evaluation results.
          </p>
        </div>

        {savedSuccess && (
          <Badge variant="success" pulse className="py-2 px-4 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 mr-1" />
            Evaluation Saved Locally!
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Project Selector & Scoring Sheet */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Project Selector */}
          <Card className="border-indigo-500/30 bg-slate-900/90">
            <CardHeader className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Evaluating Project:
                  </span>
                </div>
                <select
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                >
                  {availableSubmissions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title} ({sub.team})
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
          </Card>

          {/* Criteria Scoring Controls */}
          <Card>
            <CardHeader>
              <CardTitle icon={Sliders}>Rubric Criteria Scoring</CardTitle>
              <CardDescription>Adjust points (0 to 10) per criteria to update score calculation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {initialCriteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-200">{criterion.name}</h4>
                        <Badge variant="indigo" className="text-[10px]">
                          Weight: {(criterion.weight * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{criterion.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={scores[criterion.id] ?? 0}
                        onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                        className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-center font-mono font-semibold text-emerald-400 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">/ 10</span>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={scores[criterion.id] ?? 0}
                    onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                    className="w-full accent-indigo-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>
              ))}

              {/* Qualitative Feedback Text Box */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Judge Qualitative Feedback
                </label>
                <textarea
                  rows="4"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback for the team..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-3">
              <Button
                variant="ghost"
                icon={RotateCcw}
                onClick={() =>
                  setScores(initialCriteria.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.score }), {}))
                }
              >
                Reset Scores
              </Button>
              <Button variant="emerald" icon={Save} onClick={handleSave}>
                Save Evaluation
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Score Summary Card */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-indigo-500/30 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="justify-center">Overall Weighted Score</CardTitle>
              <CardDescription>Calculated score out of 100 pts</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6 py-6">
              <div className="inline-flex flex-col items-center justify-center h-36 w-36 rounded-full bg-slate-950 border-4 border-indigo-500/40 shadow-inner glow-indigo">
                <span className="text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-300 to-purple-400">
                  {calculateTotal()}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
                  Points
                </span>
              </div>

              {/* Formula Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
                <span className="font-semibold text-slate-300 block mb-1">Weight Contribution Breakdown:</span>
                {initialCriteria.map((c) => {
                  const s = scores[c.id] || 0;
                  const pts = ((s / c.max) * c.weight * 100).toFixed(1);
                  return (
                    <div key={c.id} className="flex justify-between text-slate-400">
                      <span className="truncate pr-2">{c.name}:</span>
                      <span className="font-mono text-indigo-300 font-medium">{pts} pts</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
