import apiClient from './client';
import { eventsApi } from './events';
import { teamsApi } from './teams';

export const registrationsApi = {
  // Register participant for an event (handles both solo and team creation/join)
  registerForHackathon: async (eventId, payload = {}) => {
    if (payload.participationType === 'team' && payload.teamName) {
      // Create team for event
      const teamRes = await teamsApi.createTeam(eventId, {
        name: payload.teamName.trim(),
        max_size: payload.maxTeamSize || 5,
      });
      return { success: true, team: teamRes, eventId };
    } else if (payload.participationType === 'join' && payload.inviteCode) {
      // Join existing team
      const teamRes = await teamsApi.joinTeam(payload.inviteCode.trim());
      return { success: true, team: teamRes, eventId };
    } else {
      // Solo registration
      const eventRes = await eventsApi.registerForEvent(eventId);
      return { success: true, event: eventRes, eventId };
    }
  },

  checkRegistrationStatus: async (eventId) => {
    try {
      const registered = await eventsApi.getRegisteredEvents();
      const items = registered.items || registered || [];
      const isReg = items.some((ev) => String(ev.id) === String(eventId));
      return { isRegistered: isReg };
    } catch {
      return { isRegistered: false };
    }
  },

  getMyRegistrations: async (params = {}) => {
    return await eventsApi.getRegisteredEvents(params);
  },
};

export default registrationsApi;
