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

export const getExpenses = () => api.get('/expenses');
export const addExpense = (expense) => api.post('/expenses', expense);
export const getExpenseDetails = (id) => api.get(`/expenses/${id}`);
export const getSettlement = () => api.get('/settlement');

export const getUsers = () => api.get('/users');

export const updateExpense = (id, expense) => api.put(`/expenses/${id}`, expense);

export default api;