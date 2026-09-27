import React, { useState } from 'react';
import { User, Mail, Github, Linkedin, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';

export default function Profile() {
  const { user } = useAuth();
  const { success } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || 'Alex Chen',
    email: user?.email || 'alex.chen@example.com',
    bio: user?.bio || 'Full-stack software architect specializing in distributed systems, FastAPI, and React.',
    github: user?.github || 'https://github.com/alexchen',
    linkedin: user?.linkedin || 'https://linkedin.com/in/alexchen',
    skills: user?.skills ? user.skills.join(', ') : 'Python, FastAPI, React, TypeScript, Docker',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    success('Profile updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
          alt={formData.name}
          className="h-16 w-16 rounded-full object-cover border-2 border-indigo-500/40"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">{formData.name}</h1>
            <Badge variant="indigo" className="capitalize">
              {user?.role || 'participant'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">{formData.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle icon={User}>Personal Details & Bio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
              <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Bio</label>
              <textarea
                rows="3"
                name="bio"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="GitHub URL" name="github" icon={Github} value={formData.github} onChange={handleChange} />
              <Input label="LinkedIn URL" name="linkedin" icon={Linkedin} value={formData.linkedin} onChange={handleChange} />
            </div>

            <Input label="Skills (comma separated)" name="skills" value={formData.skills} onChange={handleChange} />

            <div className="pt-2 flex justify-end">
              <Button variant="emerald" icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
