import React, { useState } from 'react';
import {
  FolderGit2,
  Search,
  Filter,
  ExternalLink,
  Github,
  Plus,
  Eye,
  Award,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';

const allSubmissions = [
  {
    id: 'sub-1',
    title: 'EchoMesh Local AI',
    tagline: 'Decentralized peer-to-peer LLM runner for off-grid edge devices',
    author: 'Team NeuralBytes',
    members: ['Alex Chen', 'Priya Sharma', 'David Kim'],
    status: 'Evaluated',
    score: 94.5,
    category: 'AI & Infra',
    repoUrl: 'https://github.com/example/echomesh',
    demoUrl: 'http://localhost:5000',
    description: 'EchoMesh allows low-resource devices to share memory and quantization weights over local peer-to-peer mesh networks, executing 7B parameters models locally without cloud connectivity.',
    submittedAt: '2 hours ago',
  },
  {
    id: 'sub-2',
    title: 'ZeroVault KV',
    tagline: 'High-throughput transactional key-value store built with Rust',
    author: 'Alex Vance',
    members: ['Alex Vance'],
    status: 'Under Review',
    score: null,
    category: 'Systems',
    repoUrl: 'https://github.com/example/zerovault',
    demoUrl: 'http://localhost:8080',
    description: 'ZeroVault implements lock-free MVCC storage with append-only write logs and instant zero-downtime snapshots.',
    submittedAt: '4 hours ago',
  },
  {
    id: 'sub-3',
    title: 'FlowState UI',
    tagline: 'Automated canvas-based node editor for microservice workflows',
    author: 'Team Canvas',
    members: ['Sarah Jenkins', 'Marcus Ray'],
    status: 'Submitted',
    score: null,
    category: 'Developer Tools',
    repoUrl: 'https://github.com/example/flowstate',
    demoUrl: 'http://localhost:3000',
    description: 'FlowState is a visual node graph builder that compiles interactive canvas diagrams directly into validated OpenAPI 3.0 specs and FastAPI boilerplates.',
    submittedAt: '6 hours ago',
  },
  {
    id: 'sub-4',
    title: 'PeerSync DB',
    tagline: 'Conflict-free replicated datatypes (CRDT) sync engine',
    author: 'Distributed Ops',
    members: ['Elena Rostova'],
    status: 'Submitted',
    score: null,
    category: 'Systems',
    repoUrl: 'https://github.com/example/peersync',
    demoUrl: 'http://localhost:4000',
    description: 'PeerSync offers offline-first document synchronization using state-based CRDTs with full local SQLite bindings.',
    submittedAt: '12 hours ago',
  },
];

export default function SubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const categories = ['All', 'AI & Infra', 'Systems', 'Developer Tools'];

  const filteredSubmissions = allSubmissions.filter((sub) => {
    const matchesSearch =
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || sub.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-7 h-7 text-indigo-400" />
            Project Submissions
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse, filter, and inspect hackathon project entries submitted to the local platform.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsSubmitModalOpen(true)}
        >
          New Project Entry
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <Input
            icon={Search}
            placeholder="Search by title, team, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSubmissions.map((sub) => (
          <Card key={sub.id} hoverEffect className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="indigo" className="mb-2 text-[10px]">
                    {sub.category}
                  </Badge>
                  <CardTitle>{sub.title}</CardTitle>
                </div>
                {sub.status === 'Evaluated' ? (
                  <Badge variant="success" className="shrink-0">
                    {sub.score} pts
                  </Badge>
                ) : sub.status === 'Under Review' ? (
                  <Badge variant="warning" pulse className="shrink-0">
                    Reviewing
                  </Badge>
                ) : (
                  <Badge variant="neutral" className="shrink-0">
                    Pending
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-2 line-clamp-2">{sub.tagline}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Team Leader:</span>
                  <span className="text-slate-200 font-medium">{sub.author}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Submitted:</span>
                  <span className="text-slate-300 font-mono">{sub.submittedAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={sub.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  Code Repository
                </a>
                <a
                  href={sub.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  Demo Link
                </a>
              </div>
            </CardContent>

            <div className="p-4 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                icon={Eye}
                onClick={() => setSelectedSubmission(sub)}
              >
                Inspect Details
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Award}
                onClick={() => setSelectedSubmission(sub)}
              >
                Evaluate Project
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          title={selectedSubmission.title}
          subtitle={`By ${selectedSubmission.author} • ${selectedSubmission.category}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                Close
              </Button>
              <Button variant="primary" icon={Award}>
                Grade Submission
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Project Tagline
              </h4>
              <p className="text-sm font-medium text-slate-200">{selectedSubmission.tagline}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Detailed Description
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                {selectedSubmission.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Team Members</span>
                <span className="text-xs font-medium text-slate-200">
                  {selectedSubmission.members.join(', ')}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Status</span>
                <Badge variant={selectedSubmission.status === 'Evaluated' ? 'success' : 'warning'}>
                  {selectedSubmission.status}
                </Badge>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* New Submission Modal Placeholder */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit New Project"
        subtitle="Local-first project registration form"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="emerald" onClick={() => setIsSubmitModalOpen(false)}>
              Save Project Draft
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Project Title" placeholder="e.g. EchoMesh AI" />
          <Input label="Short Tagline" placeholder="e.g. Off-grid local peer-to-peer LLM runner" />
          <Input label="Team Name / Author" placeholder="e.g. Team NeuralBytes" />
          <Input label="Repository URL" placeholder="https://github.com/..." />
        </div>
      </Modal>
    </div>
  );
}
