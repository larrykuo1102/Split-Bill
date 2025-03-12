import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { login, register } from '../services/api';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      history.push('/projects');
    }
  }, [history]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(username, password);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('username', username);
      history.replace('/projects');
    } catch (err) {
      setError(err.response?.data?.detail || '登入失敗，請檢查用戶名和密碼');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(username, password);
      alert('註冊成功，請登錄');
      setIsRegistering(false);
    } catch (error) {
      console.error('Registration error:', error);
      alert('註冊失敗，請稍後再試');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="text-center mb-4">
          {isRegistering ? '註冊' : '登錄'}
        </h2>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">用戶名</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">密碼</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? '登入中...' : isRegistering ? '註冊' : '登錄'}
          </button>
        </form>
        <div className="mt-3 text-center">
          <p>
            {isRegistering ? '已有帳號？' : '還沒有帳號？'}
            <button
              className="btn btn-link"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? '登錄' : '註冊'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;