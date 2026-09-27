import api from './api';
import { mockHackathons } from '../data/mockHackathons';

let hackathonsStore = [...mockHackathons];

export const hackathonService = {
  // GET /hackathons
  getHackathons: async (params = {}) => {
    try {
      const response = await api.get('/hackathons', { params });
      return response.data;
    } catch (error) {
      console.warn('API /hackathons unavailable, using mock data:', error.message);
      let list = [...hackathonsStore];
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((h) => h.title.toLowerCase().includes(q) || h.description.toLowerCase().includes(q));
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

  // GET /hackathons/:id
  getHackathonById: async (id) => {
    try {
      const response = await api.get(`/hackathons/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`API /hackathons/${id} unavailable, using mock data`);
      const item = hackathonsStore.find((h) => h.id === id);
      if (!item) throw new Error('Hackathon not found');
      return { data: item };
    }
  },

  // POST /hackathons (Organizer)
  createHackathon: async (payload) => {
    try {
      const response = await api.post('/hackathons', payload);
      return response.data;
    } catch (error) {
      console.warn('API POST /hackathons unavailable, updating mock store');
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
