import api from './api';
import { mockSubmissions } from '../data/mockSubmissions';

let submissionsStore = [...mockSubmissions];

export const submissionService = {
  // GET /gallery or /projects/:id
  getSubmissions: async (params = {}) => {
    try {
      const response = await api.get('/gallery', {
        params: {
          search: params.search,
          event_id: params.hackathonId || params.eventId,
          page: params.page || 1,
          limit: params.limit || 50,
        },
      });
      const items = response.data.items || response.data;
      return { data: items, total: response.data.total || items.length };
    } catch (error) {
      console.warn('API /gallery unavailable, using mock store');
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

  // GET /projects/:id
  getSubmissionById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return { data: response.data };
    } catch (error) {
      console.warn(`API /projects/${id} unavailable, using mock store`);
      const sub = submissionsStore.find((s) => s.id === id);
      if (!sub) throw new Error('Submission not found');
      return { data: sub };
    }
  },

  // POST /teams/:team_id/projects
  createSubmission: async (payload) => {
    try {
      const teamId = payload.teamId || payload.team_id;
      if (teamId) {
        const body = {
          name: payload.title || payload.name,
          description: payload.description,
          repository_url: payload.repoUrl || payload.repository_url,
          demo_url: payload.demoUrl || payload.demo_url,
        };
        const response = await api.post(`/teams/${teamId}/projects`, body);
        const createdProject = response.data;
        if (!payload.isDraft && createdProject.id) {
          await api.post(`/projects/${createdProject.id}/submit`);
        }
        return { data: createdProject, success: true };
      }
      const response = await api.post('/projects', payload);
      return { data: response.data, success: true };
    } catch (error) {
      console.warn('API POST project unavailable, adding to mock store');
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

  // PATCH /projects/:id
  updateSubmission: async (id, payload) => {
    try {
      const body = {
        name: payload.title || payload.name,
        description: payload.description,
        repository_url: payload.repoUrl || payload.repository_url,
        demo_url: payload.demoUrl || payload.demo_url,
      };
      const response = await api.patch(`/projects/${id}`, body);
      if (payload.submitNow) {
        await api.post(`/projects/${id}/submit`);
      }
      return { data: response.data, success: true };
    } catch (error) {
      console.warn(`API PATCH /projects/${id} unavailable, updating mock store`);
      const idx = submissionsStore.findIndex((s) => s.id === id);
      if (idx !== -1) {
        submissionsStore[idx] = { ...submissionsStore[idx], ...payload };
        return { data: submissionsStore[idx], success: true };
      }
      throw new Error('Submission not found');
    }
  },

  // DELETE /projects/:id
  deleteSubmission: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return { data: response.data, success: true };
    } catch (error) {
      console.warn(`API DELETE /projects/${id} unavailable, deleting from mock store`);
      submissionsStore = submissionsStore.filter((s) => s.id !== id);
      return { success: true };
    }
  },
};
