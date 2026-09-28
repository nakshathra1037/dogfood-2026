import { eventsApi } from '../api/events';
import { registrationsApi } from '../api/registrations';
import { teamsApi } from '../api/teams';

export const hackathonService = {
  // GET /events (Paginated)
  getHackathons: async (params = {}) => {
    const apiParams = {
      page: params.page || 1,
      limit: params.limit || 50,
    };
    if (params.status && params.status !== 'All') {
      apiParams.status = params.status.toUpperCase();
    }
    const response = await eventsApi.getEvents(apiParams);
    let items = response.items || response || [];
    
    // Client-side search & category filtering if needed
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (h) =>
          (h.name || h.title || '').toLowerCase().includes(q) ||
          (h.description || '').toLowerCase().includes(q)
      );
    }
    
    return { data: items, total: response.total ?? items.length };
  },

  // GET /events/:id
  getHackathonById: async (id) => {
    const data = await eventsApi.getEventById(id);
    return { data };
  },

  // GET /events/registered
  getMyRegisteredHackathons: async (params = {}) => {
    const response = await eventsApi.getRegisteredEvents(params);
    const items = response.items || response || [];
    return { data: items, total: response.total ?? items.length };
  },

  // POST /events/:id/register
  registerForHackathon: async (id, registrationData = {}) => {
    return await registrationsApi.registerForHackathon(id, registrationData);
  },

  // POST /events (Organizer / Admin)
  createHackathon: async (payload) => {
    // Format dates to ISO UTC strings
    const startDate = payload.startDate
      ? new Date(payload.startDate).toISOString()
      : new Date().toISOString();
    const endDate = payload.endDate
      ? new Date(payload.endDate).toISOString()
      : new Date(Date.now() + 7 * 86400000).toISOString();

    const body = {
      name: (payload.title || payload.name || '').trim(),
      description: payload.description || '',
      start_date: startDate,
      end_date: endDate,
      status: payload.status ? payload.status.toUpperCase() : 'ACTIVE',
      is_public: true,
    };

    const createdEvent = await eventsApi.createEvent(body);
    return { data: createdEvent, success: true };
  },
};

export default hackathonService;
