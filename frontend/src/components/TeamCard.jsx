import React from 'react';
import { Users, UserPlus, Shield, Copy, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import Badge from './Badge';
import Button from './Button';

export default function TeamCard({ team, onManage, onCopyCode, copiedCode }) {
  return (
    <Card hoverEffect className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="indigo" className="mb-2 text-[10px]">
              {team.hackathonTitle || 'DOGFOOD 2026'}
            </Badge>
            <CardTitle>{team.name}</CardTitle>
          </div>
          <Badge variant={team.status === 'Complete' ? 'success' : 'warning'}>
            {team.status}
          </Badge>
        </div>
        <CardDescription>Led by {team.leader}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Members Avatars list */}
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Team Roster ({team.members.length} / {team.maxMembers})
          </span>
          <div className="space-y-2">
            {team.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{m.avatar || '👨‍💻'}</span>
                  <div>
                    <span className="font-medium text-slate-200 block">{m.name}</span>
                    <span className="text-[10px] text-slate-400">{m.role}</span>
                  </div>
                </div>
                {m.name === team.leader && (
                  <Badge variant="purple" className="text-[9px]">
                    Leader
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invite Code box */}
        {team.inviteCode && (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Invite Code:</span>
              <span className="text-emerald-400 font-bold">{team.inviteCode}</span>
            </div>
            <button
              onClick={() => onCopyCode && onCopyCode(team.inviteCode)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copy invite code"
            >
              {copiedCode === team.inviteCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </CardContent>

      <div className="p-4 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-end">
        <Button variant="secondary" size="sm" onClick={() => onManage && onManage(team)}>
          Manage Team
        </Button>
      </div>
    </Card>
  );
}
