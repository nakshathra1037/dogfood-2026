import api from './api';
import { mockHackathons } from '../data/mockHackathons';

let hackathonsStore = [...mockHackathons];

export const hackathonService = {
  // GET /events
  getHackathons: async (params = {}) => {
    try {
      const response = await api.get('/events', { params });
      const items = response.data.items || response.data;
      return { data: items, total: response.data.total || items.length };
    } catch (error) {
      console.warn('API /events unavailable, using mock data:', error.message);
      let list = [...hackathonsStore];
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((h) => (h.title || h.name || '').toLowerCase().includes(q) || (h.description || '').toLowerCase().includes(q));
      }
      if (params.status && params.status !== 'All') {
        list = list.filter((h) => h.status === params.status);
      }
      if (params.category && params.category !== 'All') {
        list = list.filter((h) => h.category === params.category);
      }
      if (params.mode && params.mode !== 'All') {
        list = list.filter((h) => h.mode === params.mode);
      }
      return { data: list, total: list.length };
    }
  },

  // GET /events/:id
  getHackathonById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return { data: response.data };
    } catch (error) {
      console.warn(`API /events/${id} unavailable, using mock data`);
      const item = hackathonsStore.find((h) => h.id === id);
      if (!item) throw new Error('Hackathon not found');
      return { data: item };
    }
  },

  // POST /events (Organizer)
  createHackathon: async (payload) => {
    try {
      const body = {
        name: payload.title || payload.name,
        description: payload.description,
        start_date: payload.startDate || payload.start_date || new Date().toISOString(),
        end_date: payload.endDate || payload.end_date || new Date(Date.now() + 7 * 86400000).toISOString(),
        status: payload.status || 'ACTIVE',
        is_public: true,
      };
      const response = await api.post('/events', body);
      return { data: response.data, success: true };
    } catch (error) {
      console.warn('API POST /events unavailable, updating mock store');
      const newHack = {
        id: `hack-${Date.now()}`,
        status: 'Active',
        participantsCount: 0,
        teamsCount: 0,
        bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        ...payload,
      };
      hackathonsStore = [newHack, ...hackathonsStore];
      return { data: newHack, success: true };
    }
  },
};
