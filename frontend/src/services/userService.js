import api from './api';
import { mockUsers } from '../data/mockUsers';

let userStore = { ...mockUsers.currentUser };

export const userService = {
  // GET /users/profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.warn('API /users/profile unavailable, returning mock profile');
      return { data: userStore };
    }
  },

  // PUT /users/profile
  updateProfile: async (payload) => {
    try {
      const response = await api.put('/users/profile', payload);
      return response.data;
    } catch (error) {
      console.warn('API PUT /users/profile unavailable, updating mock user');
      userStore = { ...userStore, ...payload };
      return { data: userStore, success: true };
    }
  },
};
