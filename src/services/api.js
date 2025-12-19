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
  autoSave: (autoSaveData) => api.post('/exams/auto-save', autoSaveData),
  getTimeRemaining: (examAttemptId) => api.get(`/exams/${examAttemptId}/time-remaining`),
};

// Analytics API
export const analyticsAPI = {
  getRank: (examAttemptId) => api.get(`/analytics/exam/${examAttemptId}/rank`),
  getPercentile: (examAttemptId) => api.get(`/analytics/exam/${examAttemptId}/percentile`),
  getTestStatistics: (testSeriesId) => api.get(`/analytics/test-series/${testSeriesId}/statistics`),
  getDetailedAnalytics: (examAttemptId) => api.get(`/analytics/exam/${examAttemptId}/detailed`),
  getWeeklyProgress: (userId) => api.get(`/analytics/user/${userId}/weekly-progress`),
};

// User API
export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
  updateGoal: (userId, weeklyGoal) => api.post(`/users/${userId}/goal`, { weeklyGoal }),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
};

export default api;
