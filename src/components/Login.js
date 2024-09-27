import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { login, register } from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isRegistering) {
        response = await register(username, password);
        if (response.data.message === "User registered successfully") {
          alert('註冊成功，請登入');
          setIsRegistering(false);
          return;
        }
      } else {
        response = await login(username, password);
      }
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        history.push('/home');
      } else {
        alert(isRegistering ? '註冊失敗' : '登入失敗，請檢查您的用戶名和密碼。');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.detail || '發生錯誤，請稍後再試。');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">{isRegistering ? '註冊' : '登入'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="用戶名"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="密碼"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">{isRegistering ? '註冊' : '登入'}</button>
            </form>
            <button 
              className="btn btn-link w-100 mt-3"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? '已有帳號？登入' : '沒有帳號？註冊'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;