import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft, DollarSign, CheckCircle2, AlertCircle, MapPin, Tag } from 'lucide-react';
import { hackathonService } from '../services/hackathonService';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';

export default function CreateHackathon() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Artificial Intelligence',
    mode: 'Online',
    location: 'Global / Virtual',
    prizePool: '$25,000',
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'ACTIVE',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim() || !formData.description.trim()) {
      const msg = 'Please enter hackathon title and description.';
      setFormError(msg);
      toastError(msg);
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      const msg = 'Start date must be strictly before end date.';
      setFormError(msg);
      toastError(msg);
      return;
    }

    setLoading(true);
    try {
      await hackathonService.createHackathon({
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: new Date(`${formData.startDate}T00:00:00Z`).toISOString(),
        endDate: new Date(`${formData.endDate}T23:59:59Z`).toISOString(),
        status: formData.status || 'ACTIVE',
      });
      success('Hackathon created successfully.');
      navigate('/admin/hackathons');
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        err.userMessage ||
        'Unable to create hackathon. Please try again.';
      setFormError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/admin/hackathons')}>
        Back to Explore Hackathons
      </Button>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Admin Portal</span>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-400">Explore Hackathons</span>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-300">Create Hackathon</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
          <PlusCircle className="w-6 h-6 text-purple-400" />
          Create Hackathon
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Fill in the details below to add a new hackathon record to the database.
        </p>
      </div>

      <Card className="border-purple-500/20 shadow-2xl">
        <CardHeader>
          <CardTitle>Hackathon Competition Details</CardTitle>
          <CardDescription>Configure hackathon title, description, schedule, and publication status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Hackathon Name / Title *"
            name="title"
            placeholder="e.g. AI Innovation Hackathon"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Description *</label>
            <textarea
              rows="4"
              name="description"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="Full hackathon overview, rules, eligibility, and challenges..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <Input
              label="End Date *"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Location"
              name="location"
              icon={MapPin}
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Chennai or Online"
            />
            <Select
              label="Mode / Format"
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              options={['Online', 'Hybrid', 'Offline']}
            />
            <Select
              label="Initial Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={['ACTIVE', 'DRAFT']}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prizes / Prize Pool"
              name="prizePool"
              icon={DollarSign}
              value={formData.prizePool}
              onChange={handleChange}
              placeholder="e.g. $25,000"
            />
            <Input
              label="Track / Category"
              name="category"
              icon={Tag}
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. AI & Machine Learning"
            />
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-3 border-t border-slate-800 pt-4">
          <Button variant="ghost" onClick={() => navigate('/admin/hackathons')}>
            Cancel
          </Button>
          <Button variant="emerald" icon={CheckCircle2} onClick={handleSubmit} isLoading={loading}>
            Create Hackathon
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
