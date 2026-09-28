import apiClient from './client';

export const usersApi = {
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  updateProfile: async (id, data) => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },
};

export default usersApi;
