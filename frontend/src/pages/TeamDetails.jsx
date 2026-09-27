import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, UserPlus, Trash2, Shield, Copy, Check, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const [team, setTeam] = useState({
    id: id || 'team-1',
    name: 'NeuralBytes',
    hackathonTitle: 'DOGFOOD 2026 Global AI Challenge',
    leader: 'Alex Chen',
    inviteCode: 'NB-2026-X9',
    members: [
      { id: 'u1', name: 'Alex Chen', role: 'Team Lead / Fullstack', email: 'alex@example.com', avatar: '👨‍💻' },
      { id: 'u2', name: 'Priya Sharma', role: 'AI Engineer', email: 'priya@example.com', avatar: '👩‍💻' },
      { id: 'u3', name: 'David Kim', role: 'Systems Developer', email: 'david@example.com', avatar: '👨‍🔬' },
    ],
  });

  const handleRemoveMember = (memberId) => {
    setTeam((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }));
    success('Member removed from roster');
  };

  const handleAddMember = () => {
    if (!newMemberEmail) return;
    setTeam((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        { id: `u-${Date.now()}`, name: newMemberEmail.split('@')[0], role: 'Member', email: newMemberEmail, avatar: '👨‍💻' },
      ],
    }));
    setNewMemberEmail('');
    setIsInviteModalOpen(false);
    success(`Invitation sent to ${newMemberEmail}`);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/dashboard/teams')}>
        Back to Teams
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="indigo" className="mb-2 text-[10px]">{team.hackathonTitle}</Badge>
          <h1 className="text-3xl font-bold text-white tracking-tight">{team.name}</h1>
          <p className="text-slate-400 text-xs mt-1">Managed by {team.leader}</p>
        </div>

        <Button variant="emerald" icon={UserPlus} onClick={() => setIsInviteModalOpen(true)}>
          Invite Teammate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle icon={Users}>Team Roster ({team.members.length} Members)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {team.members.map((m) => (
            <div key={m.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.avatar}</span>
                <div>
                  <span className="font-semibold text-slate-200 text-sm block">{m.name}</span>
                  <span className="text-xs text-slate-400">{m.role} • {m.email}</span>
                </div>
              </div>
              {m.name !== team.leader && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/50"
                  onClick={() => handleRemoveMember(m.id)}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Teammate"
        subtitle="Send an invitation by email"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddMember}>Send Invite</Button>
          </>
        }
      >
        <Input label="Email Address" placeholder="teammate@example.com" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} />
      </Modal>
    </div>
  );
}
