import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 設置請求攔截器來添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const register = (username, password) => api.post('/users/', { username, password });
export const login = (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  return api.post('/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

export const createProject = (projectData) => api.post('/projects/', projectData);
export const getProjects = () => api.get('/projects/');
export const getProject = (projectId) => api.get(`/projects/${projectId}`);
export const joinProject = (projectId, inviteCode) => api.post(`/projects/${projectId}/join`, { invite_code: inviteCode });
export const createInviteCode = (projectId) => api.post(`/projects/${projectId}/invite`);
export const getUserProjects = () => api.get('/users/projects');

export const addFriend = (friendId) => api.post('/users/friends', { friend_id: friendId });
export const getFriends = () => api.get('/users/friends');

export const addExpense = (expenseData) => api.post('/expenses/', expenseData);
export const updateExpense = (expenseId, expenseData) => api.put(`/expenses/${expenseId}`, expenseData);
export const getExpenses = (projectId) => api.get(`/expenses/?project_id=${projectId}`);
export const getExpenseDetails = (expenseId) => api.get(`/expenses/${expenseId}`);

// 添加 getUsers 函數的導出
export const getUsers = () => api.get('/users/');

export const getSettlement = (projectId) => api.get(`/projects/${projectId}/settlement`);

export default api;