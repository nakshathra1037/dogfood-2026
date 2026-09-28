import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
  Layers,
  Award,
} from 'lucide-react';
import { eventsApi } from '../api/events';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function AdminEditHackathon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    isPublic: true,
  });

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      try {
        const ev = await eventsApi.getEventById(id);
        const startStr = ev.start_date
          ? new Date(ev.start_date).toISOString().split('T')[0]
          : '';
        const endStr = ev.end_date
          ? new Date(ev.end_date).toISOString().split('T')[0]
          : '';

        setFormData({
          name: ev.name || '',
          description: ev.description || '',
          startDate: startStr,
          endDate: endStr,
          status: ev.status || 'ACTIVE',
          isPublic: ev.is_public !== false,
        });
      } catch (err) {
        toastError('Failed to load hackathon details.');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.description.trim()) {
      const msg = 'Please enter hackathon name and description.';
      setFormError(msg);
      toastError(msg);
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      const msg = 'Start date must be strictly earlier than end date.';
      setFormError(msg);
      toastError(msg);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        start_date: new Date(`${formData.startDate}T00:00:00Z`).toISOString(),
        end_date: new Date(`${formData.endDate}T23:59:59Z`).toISOString(),
        status: formData.status,
        is_public: formData.isPublic,
      };

      await eventsApi.updateEvent(id, payload);
      success(`Hackathon "${formData.name}" successfully updated in database!`);
      navigate('/admin/hackathons');
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        err.userMessage ||
        'Failed to update hackathon in database.';
      setFormError(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner message="Loading hackathon for editing..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        icon={ArrowLeft}
        onClick={() => navigate('/admin/hackathons')}
      >
        Back to Hackathons
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FolderGit2 className="w-6 h-6 text-purple-400" />
          Edit Hackathon Event #{id}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Modify event schedule, description, or publication status. Changes are saved directly to the database.
        </p>
      </div>

      <Card className="border-purple-500/20 shadow-2xl">
        <CardHeader>
          <CardTitle>Edit Event Configuration</CardTitle>
          <CardDescription>
            Updates will instantly reflect across Explore Hackathons and Participant views.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Hackathon Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Detailed Description *</label>
            <textarea
              rows="5"
              name="description"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Publication Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="ACTIVE">ACTIVE (Published &amp; Open to Participants)</option>
                <option value="DRAFT">DRAFT (Admin Only)</option>
                <option value="ENDED">ENDED (Concluded)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="isPublic" className="text-xs text-slate-300 cursor-pointer">
                Publicly Listed in Explore Hackathons
              </label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-3 border-t border-slate-800 pt-4">
          <Button variant="ghost" onClick={() => navigate('/admin/hackathons')}>
            Cancel
          </Button>
          <Button
            variant="emerald"
            icon={Save}
            onClick={handleSubmit}
            isLoading={saving}
          >
            Save Changes to Database
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
