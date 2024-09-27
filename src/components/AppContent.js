import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';

function AppContent({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      setCurrentUser(username);
    }
  }, []);

  const handleLogout = () => {
    // 清除所有相关的本地存储项
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    // 可能还有其他需要清除的项，如果有的话也要在这里清除

    // 重置当前用户状态
    setCurrentUser(null);

    // 使用 history.replace 而不是 history.push
    // 这样可以防止用户通过浏览器的后退按钮回到已登出的页面
    history.replace('/login');

    // 可选：强制刷新页面以确保所有组件状态都被重置
    window.location.reload();
  };

  const isAuthenticated = !!localStorage.getItem('token');
  const isProjectPage = /^\/project\/\d+/.test(location.pathname);
  const projectId = isProjectPage ? location.pathname.split('/')[2] : null;

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-light mb-4">
        <div className="container">
          <Link className="navbar-brand fw-bold" to={isAuthenticated ? "/projects" : "/login"}>Expense Splitter</Link>
          {isAuthenticated && (
            <>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item me-2">
                    <Link className="btn btn-outline-primary nav-btn" to="/projects">
                      <i className="fas fa-list me-1"></i> Projects
                    </Link>
                  </li>
                  <li className="nav-item me-2">
                    <Link className="btn btn-outline-success nav-btn" to="/projects/new">
                      <i className="fas fa-plus me-1"></i> New Project
                    </Link>
                  </li>
                  {isProjectPage && (
                    <li className="nav-item me-2">
                      <Link className="btn btn-outline-primary nav-btn" to={`/settlement/${projectId}`}>
                        <i className="fas fa-balance-scale me-1"></i> Settlement
                      </Link>
                    </li>
                  )}
                  <li className="nav-item">
                    <span className="nav-link">Welcome, {currentUser}</span>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-outline-danger nav-btn" onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </nav>
      <div className="container mt-4">
        {children}
      </div>
    </div>
  );
}

export default AppContent;