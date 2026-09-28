import apiClient from './client';

export const eventsApi = {
  getEvents: async (params = {}) => {
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  getEventById: async (id) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  getRegisteredEvents: async (params = {}) => {
    const response = await apiClient.get('/events/registered', { params });
    return response.data;
  },

  createEvent: async (data) => {
    const response = await apiClient.post('/events', data);
    return response.data;
  },

  updateEvent: async (id, data) => {
    const response = await apiClient.patch(`/events/${id}`, data);
    return response.data;
  },

  registerForEvent: async (id) => {
    const response = await apiClient.post(`/events/${id}/register`);
    return response.data;
  },

  getAdminStats: async () => {
    const response = await apiClient.get('/events/admin/stats');
    return response.data;
  },

  getEventRegistrations: async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}/registrations`);
    return response.data;
  },

  addTrack: async (eventId, data) => {
    const response = await apiClient.post(`/events/${eventId}/tracks`, data);
    return response.data;
  },

  addPrize: async (eventId, data) => {
    const response = await apiClient.post(`/events/${eventId}/prizes`, data);
    return response.data;
  },
};

export default eventsApi;
