import React from 'react';
import { Github, ExternalLink, Edit3, Trash2, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import Badge from './Badge';
import Button from './Button';

export default function SubmissionCard({ submission, onEdit, onDelete, onView }) {
  return (
    <Card hoverEffect className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="indigo" className="mb-2 text-[10px]">
              {submission.hackathonTitle || 'DOGFOOD 2026'}
            </Badge>
            <CardTitle>{submission.projectName}</CardTitle>
          </div>
          <Badge
            variant={
              submission.status === 'Submitted'
                ? 'success'
                : submission.status === 'Draft'
                ? 'warning'
                : 'neutral'
            }
          >
            {submission.status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{submission.problemStatement}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
          {submission.solutionDescription}
        </p>

        {/* Tech Badges */}
        {submission.technologiesUsed && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {submission.technologiesUsed.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-slate-400 border border-slate-800"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2 text-xs">
          {submission.githubUrl && (
            <a
              href={submission.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              Repo
            </a>
          )}
          {submission.demoUrl && (
            <a
              href={submission.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Demo
            </a>
          )}
        </div>
      </CardContent>

      <div className="p-4 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="ghost" size="sm" icon={Edit3} onClick={() => onEdit(submission)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/50"
              onClick={() => onDelete(submission)}
            >
              Delete
            </Button>
          )}
        </div>
        {onView && (
          <Button variant="secondary" size="sm" onClick={() => onView(submission)}>
            View Details
          </Button>
        )}
      </div>
    </Card>
  );
}
