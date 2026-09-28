import apiClient from './client';

export const teamsApi = {
  createTeam: async (eventId, data) => {
    const response = await apiClient.post(`/events/${eventId}/teams`, data);
    return response.data;
  },

  getEventTeams: async (eventId, params = {}) => {
    const response = await apiClient.get(`/events/${eventId}/teams`, { params });
    return response.data;
  },

  getTeam: async (teamId) => {
    const response = await apiClient.get(`/teams/${teamId}`);
    return response.data;
  },

  joinTeam: async (inviteCode) => {
    const response = await apiClient.post('/teams/join', { invite_code: inviteCode });
    return response.data;
  },

  leaveTeam: async (teamId) => {
    const response = await apiClient.post(`/teams/${teamId}/leave`);
    return response.data;
  },
};

export default teamsApi;
