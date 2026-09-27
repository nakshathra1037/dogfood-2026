import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';

const initialCriteria = [
  { id: 'c1', name: 'Technical Complexity', weight: 0.3, max: 10, score: 9 },
  { id: 'c2', name: 'Originality & Innovation', weight: 0.25, max: 10, score: 8 },
  { id: 'c3', name: 'User Experience & UI', weight: 0.25, max: 10, score: 9 },
  { id: 'c4', name: 'Practical Utility', weight: 0.2, max: 10, score: 9 },
];

export default function Evaluations() {
  const [scores, setScores] = useState(
    initialCriteria.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.score }), {})
  );
  const { success } = useToast();

  const handleScoreChange = (id, val) => {
    const parsed = Math.min(10, Math.max(0, parseFloat(val) || 0));
    setScores((prev) => ({ ...prev, [id]: parsed }));
  };

  const calculateTotal = () => {
    let totalWeighted = 0;
    initialCriteria.forEach((c) => {
      const s = scores[c.id] || 0;
      totalWeighted += (s / c.max) * c.weight * 100;
    });
    return totalWeighted.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-purple-400" />
          Evaluation Matrix & Rubric Setup
        </h1>
        <p className="text-slate-400 text-xs mt-1">Configure scoring rubrics and test weighted score calculations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Rubric Test Bench</CardTitle>
              <CardDescription>Adjust sample criteria scores to preview calculated output</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {initialCriteria.map((criterion) => (
                <div key={criterion.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 text-sm block">{criterion.name}</span>
                      <Badge variant="purple" className="text-[10px]">Weight: {criterion.weight * 100}%</Badge>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={scores[criterion.id] ?? 0}
                      onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                      className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center font-mono text-emerald-400 text-sm"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={scores[criterion.id] ?? 0}
                    onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                    className="w-full accent-purple-500 bg-slate-800 rounded h-1.5 cursor-pointer"
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="emerald" icon={Save} onClick={() => success('Rubric criteria weights saved')}>
                Save Rubric Matrix
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="border-purple-500/30 bg-slate-900 text-center">
            <CardHeader>
              <CardTitle className="justify-center">Calculated Total</CardTitle>
            </CardHeader>
            <CardContent className="py-8 space-y-3">
              <span className="text-5xl font-extrabold font-mono text-purple-400 block">{calculateTotal()}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Points / 100</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
