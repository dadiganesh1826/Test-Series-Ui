import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Test Series API
export const testSeriesAPI = {
  getAll: () => api.get('/test-series'),
  getById: (id) => api.get(`/test-series/${id}`),
  getQuestions: (id) => api.get(`/test-series/${id}/questions`),
  create: (testSeries) => api.post('/test-series', testSeries),
  addQuestion: (testSeriesId, question) => api.post(`/test-series/${testSeriesId}/questions`, question),
};

// Exam API
export const examAPI = {
  startExam: (userId, testSeriesId) => api.post(`/exams/start?userId=${userId}&testSeriesId=${testSeriesId}`),
  submitExam: (examData) => api.post('/exams/submit', examData),
  getHistory: (userId) => api.get(`/exams/history?userId=${userId}`),
  getResult: (examAttemptId, userId) => api.get(`/exams/result/${examAttemptId}?userId=${userId}`),
};

export default api;
