import React, { useState } from 'react';
import { Sliders, Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';

const initialRubrics = [
  { id: 'c1', name: 'Technical Complexity', weight: 30, maxScore: 10, description: 'Depth of technical architecture and implementation rigor' },
  { id: 'c2', name: 'Originality & Innovation', weight: 25, maxScore: 10, description: 'Novelty of concept and uniqueness of solution approach' },
  { id: 'c3', name: 'User Experience & UI', weight: 25, maxScore: 10, description: 'Intuitive interface design, responsiveness, and polished UX' },
  { id: 'c4', name: 'Practical Utility', weight: 20, maxScore: 10, description: 'Real-world applicability and value to target audience' },
];

export default function CriteriaPage() {
  const [rubrics, setRubrics] = useState(initialRubrics);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCriterion, setNewCriterion] = useState({ name: '', weight: 10, description: '' });

  const totalWeight = rubrics.reduce((sum, r) => sum + Number(r.weight), 0);

  const handleAdd = () => {
    if (!newCriterion.name) return;
    setRubrics((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        name: newCriterion.name,
        weight: Number(newCriterion.weight),
        maxScore: 10,
        description: newCriterion.description || 'Custom evaluation criterion',
      },
    ]);
    setNewCriterion({ name: '', weight: 10, description: '' });
    setIsAddModalOpen(false);
  };

  const handleDelete = (id) => {
    setRubrics((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-7 h-7 text-indigo-400" />
            Evaluation Criteria & Rubrics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure evaluation criteria and set percentage weights for project scoring.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Add Criterion
        </Button>
      </div>

      {/* Weight Summary Banner */}
      <Card className={totalWeight === 100 ? 'border-emerald-500/30' : 'border-amber-500/30'}>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {totalWeight === 100 ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
            )}
            <div>
              <span className="text-sm font-semibold text-slate-100">
                Total Allocated Weight: {totalWeight}%
              </span>
              <p className="text-xs text-slate-400">
                {totalWeight === 100
                  ? 'All criteria weights perfectly total 100%.'
                  : 'Total weight should equal exactly 100% for balanced scoring.'}
              </p>
            </div>
          </div>
          <Badge variant={totalWeight === 100 ? 'success' : 'warning'} className="self-start sm:self-center font-mono">
            {totalWeight}% / 100%
          </Badge>
        </CardContent>
      </Card>

      {/* Rubrics List */}
      <div className="space-y-4">
        {rubrics.map((rubric) => (
          <Card key={rubric.id} hoverEffect className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-slate-100">{rubric.name}</h3>
                  <Badge variant="indigo" className="font-mono text-xs">
                    {rubric.weight}% Weight
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{rubric.description}</p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-mono text-slate-400">Max: 10 pts</span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/50"
                  onClick={() => handleDelete(rubric.id)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Criterion Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Rubric Criterion"
        subtitle="Specify criterion title, weight percentage, and description"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdd}>
              Add to Rubric
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Criterion Name"
            placeholder="e.g. Technical Execution"
            value={newCriterion.name}
            onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })}
          />
          <Input
            label="Weight Percentage (%)"
            type="number"
            placeholder="e.g. 25"
            value={newCriterion.weight}
            onChange={(e) => setNewCriterion({ ...newCriterion, weight: e.target.value })}
          />
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Description</label>
            <textarea
              rows="3"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="What judges should look for when scoring..."
              value={newCriterion.description}
              onChange={(e) => setNewCriterion({ ...newCriterion, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
