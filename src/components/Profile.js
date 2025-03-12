import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState({
    username: localStorage.getItem('username') || '',
    joinDate: localStorage.getItem('joinDate') || new Date().toISOString().split('T')[0]
  });
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('joinDate');
    history.push('/login');
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-name">{user.username}</h2>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <label>用戶名</label>
            <p>{user.username}</p>
          </div>
          <div className="info-item">
            <label>加入日期</label>
            <p>{new Date(user.joinDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <h4>參與的專案</h4>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-item">
            <h4>好友數量</h4>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-item">
            <h4>支出記錄</h4>
            <p className="stat-number">0</p>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-primary" onClick={() => history.push('/friends')}>
            管理好友
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            登出
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile; 