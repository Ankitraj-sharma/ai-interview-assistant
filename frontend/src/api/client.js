import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
};

export const resumeAPI = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getResume: (id) => apiClient.get(`/resume/${id}`),
};

export const jobAPI = {
  analyzeJob: (data) => apiClient.post('/job/analyze', data),
};

export const matchAPI = {
  analyzeMatch: (data) => apiClient.post('/match/analyze', data),
};

export const interviewAPI = {
  startInterview: (data) => apiClient.post('/interview/start', data),
  submitAnswer: (data) => apiClient.post('/interview/answer', data),
  finishInterview: (sessionId) => apiClient.post(`/interview/finish?session_id=${sessionId}`),
  getResult: (sessionId) => apiClient.get(`/interview/${sessionId}/result`),
};

export const voiceAPI = {
  analyzeMetrics: (data) => apiClient.post('/voice/analyze-metrics', data),
};

export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard/stats'),
};

export const systemAPI = {
  getStatus: () => apiClient.get('/'),
  getHealth: () => apiClient.get('/health'),
};

export default apiClient;
