import React, { useState, useEffect } from 'react';
import { Users, Plus, UserPlus, FolderGit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TeamCard from '../components/TeamCard';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import apiClient from '../api/client';

export default function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const [teamName, setTeamName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const { success, error } = useToast();

  const fetchEventsAndTeams = async () => {
    setLoading(true);
    try {
      // 1. Fetch user's registered events first (or all active events)
      const [regRes, allEventsRes] = await Promise.all([
        apiClient.get('/events/registered').catch(() => ({ data: { items: [] } })),
        apiClient.get('/events?limit=50').catch(() => ({ data: { items: [] } })),
      ]);

      const myEvents = regRes.data?.items || [];
      const allEvents = allEventsRes.data?.items || [];
      const availableEvents = allEvents.length > 0 ? allEvents : myEvents;
      setEvents(availableEvents);

      if (availableEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(String(availableEvents[0].id));
      }

      // 2. Fetch teams for user's events
      const targetEventList = myEvents.length > 0 ? myEvents : availableEvents;
      const teamPromises = targetEventList.map(async (ev) => {
        try {
          const tRes = await apiClient.get(`/events/${ev.id}/teams`);
          const items = tRes.data?.items || [];
          return items.map((t) => {
            const leaderMember = t.members?.find((m) => m.role === 'LEADER');
            return {
              id: t.id,
              name: t.name,
              hackathonTitle: ev.name,
              status: t.members?.length >= (t.max_size || 5) ? 'Complete' : 'Recruiting',
              leader: leaderMember?.user?.name || leaderMember?.user?.email || 'Leader',
              maxMembers: t.max_size || 5,
              inviteCode: t.invite_code,
              members: (t.members || []).map((m) => ({
                id: m.id || m.user_id,
                name: m.user?.name || m.user?.email || `User #${m.user_id}`,
                role: m.role === 'LEADER' ? 'Team Lead' : 'Member',
                avatar: '👨‍💻',
              })),
            };
          });
        } catch {
          return [];
        }
      });

      const results = await Promise.all(teamPromises);
      const combined = results.flat();
      setTeams(combined);
    } catch (err) {
      console.error('Error fetching teams:', err);
      error(err.userMessage || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsAndTeams();
  }, []);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      error('Please enter a team name');
      return;
    }
    if (!selectedEventId) {
      error('Please select an active hackathon event');
      return;
    }
    try {
      await apiClient.post(`/events/${selectedEventId}/teams`, {
        name: teamName.trim(),
        max_size: 5,
      });
      success(`Team "${teamName}" created successfully!`);
      setIsCreateModalOpen(false);
      setTeamName('');
      fetchEventsAndTeams();
    } catch (err) {
      error(err.response?.data?.error?.message || err.response?.data?.detail || err.userMessage || 'Failed to create team');
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCodeInput.trim()) {
      error('Please enter a valid invite code');
      return;
    }
    try {
      await apiClient.post('/teams/join', {
        invite_code: inviteCodeInput.trim(),
      });
      success(`Successfully joined team using invite code!`);
      setIsJoinModalOpen(false);
      setInviteCodeInput('');
      fetchEventsAndTeams();
    } catch (err) {
      error(err.response?.data?.error?.message || err.response?.data?.detail || err.userMessage || 'Invalid or expired invite code');
    }
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
      ) : teams.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-slate-200 text-sm font-semibold">No teams found</p>
            <p className="text-slate-400 text-xs">
              You haven't created or joined any teams yet. Create a team or join with an invite code to get started!
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm" icon={UserPlus} onClick={() => setIsJoinModalOpen(true)}>
              Join with Code
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
              Create Team
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((t) => (
            <TeamCard
              key={t.id}
              team={t}
              onCopyCode={handleCopyCode}
              copiedCode={copiedCode}
              onManage={(team) => success(`Managing ${team.name}`)}
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
          {events.length > 0 && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Target Hackathon</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Modal>

      {/* Join Team Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join Existing Team"
        subtitle="Enter the invite code provided by your team lead"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsJoinModalOpen(false)}>Cancel</Button>
            <Button variant="emerald" onClick={handleJoinTeam}>Join Team</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Invite Code" placeholder="e.g. sK9fA2xZ" value={inviteCodeInput} onChange={(e) => setInviteCodeInput(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
