import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('opex_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('opex_token');
      localStorage.removeItem('opex_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password });
    return response.data;
  },
  
  register: async (userData: {
    fullName: string;
    email: string;
    password: string;
    site: string;
    discipline: string;
    role: string;
    roleName: string;
  }) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  }
};

// Initiative API
export const initiativeAPI = {
  getAll: async (params?: {
    status?: string;
    site?: string;
    search?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get('/initiatives', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/initiatives/${id}`);
    return response.data;
  },
  
  create: async (initiativeData: {
    title: string;
    description: string;
    priority: string;
    expectedSavings: number;
    site: string;
    discipline: string;
    startDate: string;
    endDate: string;
    requiresMoc: boolean;
    requiresCapex: boolean;
  }) => {
    const response = await api.post('/initiatives', initiativeData);
    return response.data;
  },
  
  update: async (id: number, initiativeData: any) => {
    const response = await api.put(`/initiatives/${id}`, initiativeData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/initiatives/${id}`);
    return response.data;
  }
};

// Timeline Task API
export const timelineAPI = {
  getByInitiative: async (initiativeId: number) => {
    const response = await api.get(`/timeline-tasks/initiative/${initiativeId}`);
    return response.data;
  },
  
  create: async (taskData: any) => {
    const response = await api.post('/timeline-tasks', taskData);
    return response.data;
  },
  
  update: async (id: number, taskData: any) => {
    const response = await api.put(`/timeline-tasks/${id}`, taskData);
    return response.data;
  },
  
  updateProgress: async (id: number, progress: number) => {
    const response = await api.put(`/timeline-tasks/${id}/progress?progress=${progress}`);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/timeline-tasks/${id}`);
    return response.data;
  }
};

// Workflow API
export const workflowAPI = {
  getStages: async (initiativeId: number) => {
    const response = await api.get(`/workflow/initiative/${initiativeId}`);
    return response.data;
  },
  
  approveStage: async (stageId: number, comments?: string) => {
    const response = await api.post(`/workflow/stage/${stageId}/approve`, comments);
    return response.data;
  },
  
  rejectStage: async (stageId: number, comments: string) => {
    const response = await api.post(`/workflow/stage/${stageId}/reject`, comments);
    return response.data;
  },
  
  getPendingApprovals: async (userId: number) => {
    const response = await api.get(`/workflow/pending/${userId}`);
    return response.data;
  }
};

// Comment API
export const commentAPI = {
  getByInitiative: async (initiativeId: number) => {
    const response = await api.get(`/comments/initiative/${initiativeId}`);
    return response.data;
  },
  
  create: async (commentData: {
    content: string;
    initiativeId: number;
  }) => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },
  
  update: async (id: number, content: string) => {
    const response = await api.put(`/comments/${id}`, { content });
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  }
};

// User API
export const userAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getBySite: async (site: string) => {
    const response = await api.get(`/users/site/${site}`);
    return response.data;
  },
  
  getByRole: async (role: string) => {
    const response = await api.get(`/users/role/${role}`);
    return response.data;
  },
  
  getBySiteAndRole: async (site: string, role: string) => {
    const response = await api.get(`/users/site/${site}/role/${role}`);
    return response.data;
  }
};

export default api;