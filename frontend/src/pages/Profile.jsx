import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  Github,
  Linkedin,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';

export default function Profile() {
  const { user, switchRole } = useAuth();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+1 (555) 019-2834',
    college: user?.college || 'Massachusetts Institute of Technology',
    course: user?.course || 'Computer Science & Engineering',
    year: user?.year || '3rd Year',
    github: user?.github || 'https://github.com/alexchen',
    linkedin: user?.linkedin || 'https://linkedin.com/in/alexchen',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success('Profile details updated successfully!');
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-2xl">
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{formData.name || 'User Profile'}</h1>
              <Badge variant="indigo" className="uppercase font-mono text-[10px]">
                {user?.role || 'PARTICIPANT'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{formData.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Form (Requirement 18) */}
      <Card className="border-indigo-500/20 shadow-xl">
        <CardHeader>
          <CardTitle icon={User}>Participant Information</CardTitle>
          <CardDescription>
            Manage your personal, academic, and professional developer links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={User}
                required
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
              />
              <Input
                label="College / University"
                name="college"
                value={formData.college}
                onChange={handleChange}
                icon={Building}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Course / Degree"
                name="course"
                value={formData.course}
                onChange={handleChange}
                icon={GraduationCap}
              />

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Year of Study</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Post-Graduate">Post-Graduate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="GitHub Profile URL"
                name="github"
                icon={Github}
                value={formData.github}
                onChange={handleChange}
              />
              <Input
                label="LinkedIn Profile URL"
                name="linkedin"
                icon={Linkedin}
                value={formData.linkedin}
                onChange={handleChange}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="emerald" icon={Save} isLoading={saving} type="submit">
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
