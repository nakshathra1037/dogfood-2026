import api from './api';
import { mockUsers } from '../data/mockUsers';

let userStore = { ...mockUsers.currentUser };

export const userService = {
  // GET /auth/me
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return { data: response.data };
    } catch (error) {
      console.warn('API /auth/me unavailable, returning mock profile');
      return { data: userStore };
    }
  },

  // PATCH /users/:id
  updateProfile: async (payload) => {
    try {
      const userId = payload.id || userStore.id;
      if (userId) {
        const response = await api.patch(`/users/${userId}`, payload);
        return { data: response.data, success: true };
      }
      const response = await api.patch('/users/me', payload);
      return { data: response.data, success: true };
    } catch (error) {
      console.warn('API update user profile unavailable, updating mock user');
      userStore = { ...userStore, ...payload };
      return { data: userStore, success: true };
    }
  },
};
