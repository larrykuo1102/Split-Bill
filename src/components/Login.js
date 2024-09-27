import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { login, register } from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);  // 添加這行
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      history.push('/projects');
    }
  }, [history]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      localStorage.setItem('token', response.data.access_token);
      history.push('/projects');
    } catch (error) {
      console.error('Login error:', error);
      alert('登錄失敗，請檢查用戶名和密碼');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(username, password);
      alert('註冊成功，請登錄');
      setIsRegistering(false);  // 註冊成功後切換回登錄模式
    } catch (error) {
      console.error('Registration error:', error);
      alert('註冊失敗，請稍後再試');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">
              {isRegistering ? '註冊' : '登錄'}
            </h2>
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
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                {isRegistering ? '註冊' : '登錄'}
              </button>
            </form>
            <p className="text-center mt-3">
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
    </div>
  );
}

export default Login;