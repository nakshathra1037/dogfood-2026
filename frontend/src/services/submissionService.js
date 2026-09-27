import api from './api';
import { mockSubmissions } from '../data/mockSubmissions';

let submissionsStore = [...mockSubmissions];

export const submissionService = {
  // GET /submissions
  getSubmissions: async (params = {}) => {
    try {
      const response = await api.get('/submissions', { params });
      return response.data;
    } catch (error) {
      console.warn('API /submissions unavailable, using mock store');
      let list = [...submissionsStore];
      if (params.hackathonId) {
        list = list.filter((s) => s.hackathonId === params.hackathonId);
      }
      if (params.status && params.status !== 'All') {
        list = list.filter((s) => s.status === params.status);
      }
      return { data: list, total: list.length };
    }
  },

  // GET /submissions/:id
  getSubmissionById: async (id) => {
    try {
      const response = await api.get(`/submissions/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`API /submissions/${id} unavailable, using mock store`);
      const sub = submissionsStore.find((s) => s.id === id);
      if (!sub) throw new Error('Submission not found');
      return { data: sub };
    }
  },

  // POST /submissions
  createSubmission: async (payload) => {
    try {
      const response = await api.post('/submissions', payload);
      return response.data;
    } catch (error) {
      console.warn('API POST /submissions unavailable, adding to mock store');
      const newSub = {
        id: `sub-${Date.now()}`,
        status: payload.isDraft ? 'Draft' : 'Submitted',
        evaluationStatus: 'Pending',
        score: null,
        submittedAt: payload.isDraft ? null : new Date().toISOString(),
        deadline: '2026-10-03T23:59:59Z',
        ...payload,
      };
      submissionsStore = [newSub, ...submissionsStore];
      return { data: newSub, success: true };
    }
  },

  // PUT /submissions/:id
  updateSubmission: async (id, payload) => {
    try {
      const response = await api.put(`/submissions/${id}`, payload);
      return response.data;
    } catch (error) {
      console.warn(`API PUT /submissions/${id} unavailable, updating mock store`);
      const idx = submissionsStore.findIndex((s) => s.id === id);
      if (idx !== -1) {
        submissionsStore[idx] = { ...submissionsStore[idx], ...payload };
        return { data: submissionsStore[idx], success: true };
      }
      throw new Error('Submission not found');
    }
  },

  // DELETE /submissions/:id
  deleteSubmission: async (id) => {
    try {
      const response = await api.delete(`/submissions/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`API DELETE /submissions/${id} unavailable, deleting from mock store`);
      submissionsStore = submissionsStore.filter((s) => s.id !== id);
      return { success: true };
    }
  },
};
