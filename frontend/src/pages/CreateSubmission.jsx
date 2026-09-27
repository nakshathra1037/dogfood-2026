import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, Github, ExternalLink, Upload, CheckCircle2 } from 'lucide-react';
import { submissionService } from '../services/submissionService';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';

export default function CreateSubmission() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    projectName: '',
    hackathonId: 'hack-1',
    hackathonTitle: 'DOGFOOD 2026 Global AI Challenge',
    teamName: 'NeuralBytes',
    problemStatement: '',
    solutionDescription: '',
    features: '',
    technologiesUsed: 'FastAPI, React, Vite, Python, Tailwind CSS, Docker',
    githubUrl: '',
    demoUrl: '',
    deckFileName: '',
    screenshotsUrl: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!formData.projectName || (!isDraft && (!formData.problemStatement || !formData.githubUrl))) {
      error('Please complete all required fields (Project Name, Problem Statement, GitHub URL).');
      return;
    }

    setLoading(true);
    try {
      await submissionService.createSubmission({
        ...formData,
        isDraft,
        technologiesUsed: formData.technologiesUsed.split(',').map((s) => s.trim()),
        features: formData.features.split('\n').filter(Boolean),
      });
      success(isDraft ? 'Submission saved as draft!' : 'Project submission published successfully!');
      navigate('/dashboard/submissions');
    } catch (err) {
      error(err.message || 'Failed to submit project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/dashboard/submissions')}>
        Back to Submissions
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-indigo-400" />
          Project Submission Form
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Complete the form below to submit your hackathon project for judging.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. General Information</CardTitle>
          <CardDescription>Target competition & project details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Hackathon Competition"
            name="hackathonTitle"
            value={formData.hackathonTitle}
            onChange={handleChange}
            options={[
              'DOGFOOD 2026 Global AI Challenge',
              'CyberShield Quantum Hack 2026',
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Project Name *"
              name="projectName"
              placeholder="e.g. EchoMesh AI"
              value={formData.projectName}
              onChange={handleChange}
            />
            <Input
              label="Team Name"
              name="teamName"
              value={formData.teamName}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Project Description & Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Problem Statement *</label>
            <textarea
              rows="3"
              name="problemStatement"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Describe the challenge your project solves..."
              value={formData.problemStatement}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Solution Description *</label>
            <textarea
              rows="4"
              name="solutionDescription"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Detailed explanation of your technical solution architecture..."
              value={formData.solutionDescription}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Key Features (One per line)</label>
            <textarea
              rows="3"
              name="features"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              value={formData.features}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Technologies Used (comma separated)"
            name="technologiesUsed"
            placeholder="FastAPI, React, Vite, Python, Tailwind CSS"
            value={formData.technologiesUsed}
            onChange={handleChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Links & Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub Repository URL *"
              name="githubUrl"
              icon={Github}
              placeholder="https://github.com/org/repo"
              value={formData.githubUrl}
              onChange={handleChange}
            />
            <Input
              label="Live Demo URL"
              name="demoUrl"
              icon={ExternalLink}
              placeholder="http://localhost:5173"
              value={formData.demoUrl}
              onChange={handleChange}
            />
          </div>

          {/* Upload Placeholder */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Presentation Deck / Pitch File</label>
            <div className="p-6 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/60 text-center space-y-2">
              <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
              <p className="text-xs text-slate-400">Drag & drop pitch PDF deck or click to select file</p>
              <span className="text-[10px] font-mono text-slate-500">Max file size: 25MB (.pdf, .pptx)</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-3">
          <Button variant="secondary" onClick={() => handleSubmit(true)} isLoading={loading}>
            Save Draft
          </Button>
          <Button variant="emerald" icon={CheckCircle2} onClick={() => handleSubmit(false)} isLoading={loading}>
            Publish Final Submission
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
