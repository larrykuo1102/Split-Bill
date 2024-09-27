import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import ExpenseDetails from './components/ExpenseDetails';
import Settlement from './components/Settlement';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      setCurrentUser(username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setCurrentUser(null);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-light mb-4">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/">Expense Splitter</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                {currentUser && (
                  <>
                    <li className="nav-item me-2">
                      <Link className="btn btn-outline-primary nav-btn" to="/home">
                        <i className="fas fa-home me-1"></i> Home
                      </Link>
                    </li>
                    <li className="nav-item me-2">
                      <Link className="btn btn-outline-primary nav-btn" to="/settlement">
                        <i className="fas fa-balance-scale me-1"></i> Settlement
                      </Link>
                    </li>
                    <li className="nav-item">
                      <span className="nav-link">Welcome, {currentUser}</span>
                    </li>
                    <li className="nav-item">
                      <button className="btn btn-outline-danger nav-btn" onClick={handleLogout}>Logout</button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>
        <div className="container mt-4">
          <Switch>
            <Route exact path="/" render={(props) => <Login {...props} setCurrentUser={setCurrentUser} />} />
            <Route path="/home" component={Home} />
            <Route path="/expense/:id" component={ExpenseDetails} />
            <Route path="/settlement" component={Settlement} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;