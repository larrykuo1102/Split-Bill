import React, { useState, useEffect } from 'react';
import { getFriends, addFriend, getUsers } from '../services/api';
import './FriendList.css';

function FriendList() {
  const [friends, setFriends] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFriends();
    fetchUsers();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await getFriends();
      setFriends(response.data);
    } catch (error) {
      setError('獲取好友列表失敗');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      setError('獲取用戶列表失敗');
    }
  };

  const handleAddFriend = async () => {
    if (!selectedUser) {
      setError('請選擇要添加的好友');
      return;
    }

    try {
      await addFriend(selectedUser);
      setSuccess('好友添加成功！');
      setSelectedUser('');
      fetchFriends();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.detail || '添加好友失敗');
    }
  };

  return (
    <div className="friend-list-container">
      <div className="friend-list-card">
        <h2 className="text-center mb-4">好友列表</h2>
        
        {/* 添加好友區塊 */}
        <div className="add-friend-section mb-4">
          <h3 className="h5 mb-3">添加新好友</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="input-group">
            <select
              className="form-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">選擇用戶</option>
              {users
                .filter(user => !friends.includes(user))
                .map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={handleAddFriend}
              disabled={!selectedUser}
            >
              添加
            </button>
          </div>
        </div>

        {/* 好友列表區塊 */}
        <div className="friends-section">
          <h3 className="h5 mb-3">我的好友</h3>
          {friends.length === 0 ? (
            <p className="text-muted">還沒有好友，快去添加吧！</p>
          ) : (
            <div className="friend-grid">
              {friends.map(friend => (
                <div key={friend} className="friend-card">
                  <div className="friend-avatar">
                    {friend.charAt(0).toUpperCase()}
                  </div>
                  <div className="friend-name">{friend}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FriendList; 