import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Calendar, DollarSign, Tag, CheckCircle2 } from 'lucide-react';
import { hackathonService } from '../services/hackathonService';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';

export default function CreateHackathon() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    organizer: 'OpenSource Foundation',
    tagline: '',
    description: '',
    category: 'Artificial Intelligence',
    mode: 'Online',
    prizePool: '$50,000',
    startDate: '2026-10-01',
    endDate: '2026-10-03',
    minTeamSize: 1,
    maxTeamSize: 4,
    technologies: 'FastAPI, React, Vite, Python, Docker',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.tagline || !formData.description) {
      error('Please complete all required fields (Title, Tagline, Description).');
      return;
    }

    setLoading(true);
    try {
      await hackathonService.createHackathon({
        ...formData,
        technologies: formData.technologies.split(',').map((s) => s.trim()),
      });
      success(`Hackathon "${formData.title}" created successfully!`);
      navigate('/organizer/hackathons');
    } catch (err) {
      error(err.message || 'Failed to create hackathon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/organizer')}>
        Back to Organizer Dashboard
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-purple-400" />
          Create New Hackathon Event
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Publish a new hackathon competition, set timeline dates, prizes, and team constraints.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hackathon Event Details</CardTitle>
          <CardDescription>General information & category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Hackathon Title *"
            name="title"
            placeholder="e.g. DOGFOOD 2026 AI Challenge"
            value={formData.title}
            onChange={handleChange}
          />

          <Input
            label="Short Tagline *"
            name="tagline"
            placeholder="e.g. Build next-generation edge AI applications"
            value={formData.tagline}
            onChange={handleChange}
          />

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Detailed Description *</label>
            <textarea
              rows="4"
              name="description"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Full hackathon overview, rules, and background..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={['Artificial Intelligence', 'Cybersecurity', 'Sustainability', 'Web3 & Blockchain']}
            />
            <Select
              label="Mode"
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              options={['Online', 'Hybrid', 'Offline']}
            />
            <Input
              label="Prize Pool"
              name="prizePool"
              icon={DollarSign}
              value={formData.prizePool}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
            <Input
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Min Team Size"
              type="number"
              name="minTeamSize"
              value={formData.minTeamSize}
              onChange={handleChange}
            />
            <Input
              label="Max Team Size"
              type="number"
              name="maxTeamSize"
              value={formData.maxTeamSize}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Allowed Technologies (comma separated)"
            name="technologies"
            value={formData.technologies}
            onChange={handleChange}
          />
        </CardContent>

        <CardFooter className="justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate('/organizer')}>
            Cancel
          </Button>
          <Button variant="emerald" icon={CheckCircle2} onClick={handleSubmit} isLoading={loading}>
            Publish Hackathon
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
