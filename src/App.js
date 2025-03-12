import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ExpenseDetails from './components/ExpenseDetails';
import Settlement from './components/Settlement';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import CreateProject from './components/CreateProject';
import FriendList from './components/FriendList';
import Profile from './components/Profile';
import AppContent from './components/AppContent';

// 新增 PrivateRoute 組件
const PrivateRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <AppContent>
        <Switch>
          <Route exact path="/login">
            {isAuthenticated ? <Redirect to="/projects" /> : <Login />}
          </Route>
          <Route exact path="/register">
            {isAuthenticated ? <Redirect to="/projects" /> : <Register />}
          </Route>
          <PrivateRoute exact path="/projects" component={ProjectList} />
          <PrivateRoute path="/projects/new" component={CreateProject} />
          <PrivateRoute path="/project/:id" component={ProjectDetails} />
          <PrivateRoute path="/expense/:id" component={ExpenseDetails} />
          <PrivateRoute path="/settlement/:projectId" component={Settlement} />
          <PrivateRoute path="/friends" component={FriendList} />
          <PrivateRoute path="/profile" component={Profile} />
          <Redirect from="/" to={isAuthenticated ? "/projects" : "/login"} />
        </Switch>
      </AppContent>
    </Router>
  );
}

export default App;