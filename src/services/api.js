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

// 用戶認證相關
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

// 專案管理相關
export const createProject = (projectData) => api.post('/projects/', projectData);
export const getProjects = () => api.get('/projects/');
export const getProject = (projectId) => api.get(`/projects/${projectId}`);
export const joinProject = (projectId, inviteCode) => api.post(`/projects/${projectId}/join`, { invite_code: inviteCode });
export const createInviteCode = (projectId) => api.post(`/projects/${projectId}/invite`);

// 好友管理相關
export const addFriend = (username) => api.post('/users/friends', { username });
export const getFriends = () => api.get('/users/friends');

// 支出管理相關
export const addExpense = (expenseData) => api.post('/expenses/', {
  ...expenseData,
  amount: parseFloat(expenseData.amount)
});
export const updateExpense = (expenseId, expenseData) => api.put(`/expenses/${expenseId}`, {
  ...expenseData,
  amount: parseFloat(expenseData.amount)
});
export const getExpenses = (projectId) => api.get(`/expenses/?project_id=${projectId}`);
export const getExpenseDetails = (expenseId) => api.get(`/expenses/${expenseId}`);

// 用戶管理相關
export const getUsers = () => api.get('/users/');

// 結算相關
export const getSettlement = (projectId) => api.get(`/projects/${projectId}/settlement`);

export default api;