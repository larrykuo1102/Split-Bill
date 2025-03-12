import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import './AppContent.css';

function AppContent({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]); // 每次路徑改變時檢查

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (!token && !isPublicRoute(location.pathname)) {
      history.replace('/login');
      return;
    }
    
    if (username && token) {
      setCurrentUser(username);
    } else {
      setCurrentUser(null);
    }
  };

  const isPublicRoute = (path) => {
    return ['/login', '/register'].includes(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setCurrentUser(null);
    history.replace('/login');
  };

  const isAuthenticated = !!localStorage.getItem('token');
  const isProjectPage = /^\/project\/\d+/.test(location.pathname);
  const projectId = isProjectPage ? location.pathname.split('/')[2] : null;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="app-container">
      {isAuthenticated && (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <Link className="navbar-brand" to="/projects">Split Bill</Link>
            <button
              className="navbar-toggler"
              type="button"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}
                    to="/projects"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    專案列表
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === '/friends' ? 'active' : ''}`}
                    to="/friends"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    好友管理
                  </Link>
                </li>
              </ul>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <span className="nav-link user-name">
                    歡迎，{currentUser}
                  </span>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    個人資料
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link"
                    onClick={handleLogout}
                  >
                    登出
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}
      <main className={`main-content ${isAuthenticated ? 'with-nav' : ''}`}>
        <div className="container mt-4">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppContent;