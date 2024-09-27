import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { getProjects, joinProject, createInviteCode } from '../services/api';
import './ProjectList.css';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [joinProjectId, setJoinProjectId] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const history = useHistory();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleProjectClick = (projectId) => {
    history.push(`/project/${projectId}`);
  };

  const handleJoinProject = async (e) => {
    e.preventDefault();
    try {
      await joinProject(joinProjectId, inviteCode);
      setJoinProjectId('');
      setInviteCode('');
      fetchProjects();
    } catch (error) {
      console.error('Error joining project:', error);
    }
  };

  const handleCreateInviteCode = async (projectId) => {
    try {
      const response = await createInviteCode(projectId);
      alert(`Invite code: ${response.data.invite_code}`);
    } catch (error) {
      console.error('Error creating invite code:', error);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Projects</h2>
      <div className="row">
        {projects.map(project => (
          <div key={project.id} className="col-md-4 mb-4">
            <div className="project-card">
              <h3>{project.name}</h3>
              <p>{project.date}</p>
              <button className="btn btn-primary" onClick={() => handleProjectClick(project.id)}>View Details</button>
              <button className="btn btn-secondary mt-2" onClick={() => handleCreateInviteCode(project.id)}>Create Invite Code</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h3>Join a Project</h3>
        <form onSubmit={handleJoinProject}>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Project ID"
              value={joinProjectId}
              onChange={(e) => setJoinProjectId(e.target.value)}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Invite Code (optional)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Join Project</button>
          </div>
        </form>
      </div>
      <div className="mt-4">
        <Link to="/projects/new" className="btn btn-success">Create New Project</Link>
      </div>
    </div>
  );
}

export default ProjectList;