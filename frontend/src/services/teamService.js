import api from './api';
import { mockTeams } from '../data/mockTeams';

let teamsStore = [...mockTeams];

export const teamService = {
  // GET /teams
  getTeams: async (params = {}) => {
    try {
      const response = await api.get('/teams', { params });
      return response.data;
    } catch (error) {
      console.warn('API /teams unavailable, using mock store');
      let list = [...teamsStore];
      if (params.hackathonId) {
        list = list.filter((t) => t.hackathonId === params.hackathonId);
      }
      return { data: list, total: list.length };
    }
  },

  // GET /teams/:id
  getTeamById: async (id) => {
    try {
      const response = await api.get(`/teams/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`API /teams/${id} unavailable, using mock store`);
      const team = teamsStore.find((t) => t.id === id);
      if (!team) throw new Error('Team not found');
      return { data: team };
    }
  },

  // POST /teams
  createTeam: async (payload) => {
    try {
      const response = await api.post('/teams', payload);
      return response.data;
    } catch (error) {
      console.warn('API POST /teams unavailable, creating team in mock store');
      const newTeam = {
        id: `team-${Date.now()}`,
        status: 'Recruiting',
        inviteCode: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString().split('T')[0],
        members: payload.leader ? [{ id: 'u1', name: payload.leader, role: 'Team Lead', avatar: '👨‍💻' }] : [],
        maxMembers: payload.maxMembers || 4,
        ...payload,
      };
      teamsStore = [newTeam, ...teamsStore];
      return { data: newTeam, success: true };
    }
  },

  // POST /teams/:id/members (Join/Invite)
  addTeamMember: async (teamId, memberData) => {
    try {
      const response = await api.post(`/teams/${teamId}/members`, memberData);
      return response.data;
    } catch (error) {
      console.warn(`API POST /teams/${teamId}/members unavailable, updating mock store`);
      const idx = teamsStore.findIndex((t) => t.id === teamId);
      if (idx !== -1) {
        const newMember = {
          id: `u-${Date.now()}`,
          name: memberData.name || memberData.email,
          role: memberData.role || 'Member',
          email: memberData.email,
          avatar: '👨‍💻',
        };
        teamsStore[idx].members.push(newMember);
        return { data: teamsStore[idx], success: true };
      }
      throw new Error('Team not found');
    }
  },

  // DELETE /teams/:teamId/members/:memberId
  removeTeamMember: async (teamId, memberId) => {
    try {
      const response = await api.delete(`/teams/${teamId}/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.warn(`API DELETE member unavailable, updating mock store`);
      const idx = teamsStore.findIndex((t) => t.id === teamId);
      if (idx !== -1) {
        teamsStore[idx].members = teamsStore[idx].members.filter((m) => m.id !== memberId);
        return { data: teamsStore[idx], success: true };
      }
      throw new Error('Team not found');
    }
  },
};
