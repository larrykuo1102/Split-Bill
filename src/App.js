import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import ExpenseDetails from './components/ExpenseDetails';
import Settlement from './components/Settlement';

function App() {
  return (
    <Router>
      <div className="App container-fluid mt-4">
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">Expense Splitter</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <div className="navbar-nav">
                <Link className="nav-link" to="/home">Home</Link>
                <Link className="nav-link" to="/settlement">Settlement</Link>
              </div>
            </div>
          </div>
        </nav>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/home" component={Home} />
          <Route path="/expense/:id" component={ExpenseDetails} />
          <Route path="/settlement" component={Settlement} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;