import { api } from '../lib/axios';

// ==========================================
// AUTH SERVICES
// ==========================================
export const authApi = {
  register: async (payload: any) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
  login: async (payload: any) => {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// ==========================================
// PAPER LIBRARY SERVICES
// ==========================================
export const papersApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/papers/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getList: async () => {
    const response = await api.get('/papers');
    return response.data;
  },
  getDetails: async (id: string) => {
    const response = await api.get(`/papers/${id}`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/papers/${id}`);
    return response.data;
  },
  search: async (query: string) => {
    const response = await api.get(`/papers/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  compare: async (paperIds: string[]) => {
    const response = await api.post('/papers/compare', { paperIds });
    return response.data;
  },
};

// ==========================================
// SUMMARY SERVICES
// ==========================================
export const summaryApi = {
  generate: async (paperId: string) => {
    const response = await api.post(`/papers/${paperId}/summary`);
    return response.data;
  },
  get: async (paperId: string) => {
    const response = await api.get(`/papers/${paperId}/summary`);
    return response.data;
  },
};

// ==========================================
// CHAT SERVICES
// ==========================================
export const chatApi = {
  getHistory: async (paperId: string) => {
    const response = await api.get(`/papers/${paperId}/chat`);
    return response.data;
  },
  askQuestion: async (paperId: string, question: string) => {
    const response = await api.post(`/papers/${paperId}/chat`, { question });
    return response.data;
  },
};

// ==========================================
// CITATION SERVICES
// ==========================================
export const citationsApi = {
  getList: async (paperId: string) => {
    const response = await api.get(`/papers/${paperId}/citations`);
    return response.data;
  },
};
