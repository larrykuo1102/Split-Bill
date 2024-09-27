import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (username, password) => 
  api.post('/token', new URLSearchParams({ username, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

export const register = (username, password) => 
  api.post('/register', { username, password });

export const getExpenses = (projectId) => api.get('/expenses', { params: { project_id: projectId } });

export const addExpense = (expense) => api.post('/expenses', expense);
export const getExpenseDetails = (id) => api.get(`/expenses/${id}`);
export const getSettlement = (projectId) => api.get(`/settlement/${projectId}`);

export const getUsers = () => api.get('/users');

export const updateExpense = (id, expense) => api.put(`/expenses/${id}`, expense);

export const createProject = (project) => api.post('/projects', project);
export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);

export default api;