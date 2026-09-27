import React, { useState, useEffect } from 'react';
import { Users, Plus, UserPlus } from 'lucide-react';
import { teamService } from '../services/teamService';
import { useToast } from '../context/ToastContext';
import TeamCard from '../components/TeamCard';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Loader from '../components/Loader';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const [teamName, setTeamName] = useState('');
  const [hackathonTitle, setHackathonTitle] = useState('DOGFOOD 2026 Global AI Challenge');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const { success, error } = useToast();

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await teamService.getTeams();
      setTeams(res.data || []);
    } catch (err) {
      error(err.message || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async () => {
    if (!teamName) {
      error('Please enter a team name');
      return;
    }
    try {
      await teamService.createTeam({ name: teamName, hackathonTitle, leader: 'Alex Chen' });
      success(`Team "${teamName}" created!`);
      setIsCreateModalOpen(false);
      setTeamName('');
      fetchTeams();
    } catch (err) {
      error(err.message || 'Failed to create team');
    }
  };

  const handleJoinTeam = () => {
    if (!inviteCodeInput) {
      error('Please enter a valid invite code');
      return;
    }
    success(`Joined team using code ${inviteCodeInput}!`);
    setIsJoinModalOpen(false);
    setInviteCodeInput('');
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success('Invite code copied to clipboard!');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            My Teams & Collaboration
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Create new hacker teams, manage teammates, and issue invite codes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={UserPlus} onClick={() => setIsJoinModalOpen(true)}>
            Join Team
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Create Team
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader fullPage message="Loading teams..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((t) => (
            <TeamCard
              key={t.id}
              team={t}
              onCopyCode={handleCopyCode}
              copiedCode={copiedCode}
              onManage={(team) => success(`Opened manager for ${team.name}`)}
            />
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Team"
        subtitle="Form a team for an active hackathon competition"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateTeam}>Create Team</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Team Name" placeholder="e.g. NeuralBytes" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
          <Input label="Hackathon" value={hackathonTitle} disabled />
        </div>
      </Modal>

      {/* Join Team Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join Existing Team"
        subtitle="Enter the 8-character invite code provided by your team lead"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsJoinModalOpen(false)}>Cancel</Button>
            <Button variant="emerald" onClick={handleJoinTeam}>Join Team</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Invite Code" placeholder="e.g. NB-2026-X9" value={inviteCodeInput} onChange={(e) => setInviteCodeInput(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
