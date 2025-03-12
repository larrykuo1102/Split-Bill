import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { getProjects, joinProject, createInviteCode } from '../services/api';
import './ProjectList.css';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [joinProjectId, setJoinProjectId] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const history = useHistory();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      setError('獲取專案列表失敗');
    }
  };

  const handleProjectClick = (projectId) => {
    history.push(`/project/${projectId}`);
  };

  const handleJoinProject = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!joinProjectId) {
      setError('請輸入專案 ID');
      return;
    }

    if (!inviteCode) {
      setError('請輸入邀請碼');
      return;
    }

    try {
      await joinProject(joinProjectId, inviteCode);
      setSuccess('成功加入專案！');
      setJoinProjectId('');
      setInviteCode('');
      fetchProjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.detail || '加入專案失敗，請檢查專案 ID 和邀請碼是否正確');
    }
  };

  const handleCreateInviteCode = async (projectId) => {
    try {
      const response = await createInviteCode(projectId);
      const inviteCode = response.data.invite_code;
      
      // 創建一個臨時輸入框來複製邀請碼
      const tempInput = document.createElement('input');
      tempInput.value = inviteCode;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      
      alert(`邀請碼已複製到剪貼簿：${inviteCode}`);
    } catch (error) {
      alert('生成邀請碼失敗：' + (error.response?.data?.detail || '請稍後再試'));
    }
  };

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col">
          <h2>我的專案</h2>
        </div>
        <div className="col-auto">
          <Link to="/projects/new" className="btn btn-success">
            <i className="fas fa-plus"></i> 創建新專案
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row">
        {projects.map(project => (
          <div key={project.id} className="col-md-4 mb-4">
            <div className="project-card">
              <h3>{project.name}</h3>
              <p>{project.date}</p>
              <div className="project-card-actions">
                <button 
                  className="btn btn-primary mb-2" 
                  onClick={() => handleProjectClick(project.id)}
                >
                  查看詳情
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleCreateInviteCode(project.id)}
                >
                  生成邀請碼
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="join-project-section mt-4">
        <h3>加入專案</h3>
        <form onSubmit={handleJoinProject} className="join-project-form">
          <div className="row g-3">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="專案 ID"
                value={joinProjectId}
                onChange={(e) => setJoinProjectId(e.target.value)}
                required
              />
            </div>
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="邀請碼"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                加入專案
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectList;