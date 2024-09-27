import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { getProjects } from '../services/api';
import './ProjectList.css';

function ProjectList() {
  const [projects, setProjects] = useState([]);
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

  return (
    <div className="container">
      <h2 className="mb-4">Projects</h2>
      <div className="row">
        {projects.map(project => (
          <div key={project.id} className="col-md-4 mb-4">
            <div 
              className="project-card" 
              onClick={() => handleProjectClick(project.id)}
            >
              <h3>{project.name}</h3>
              <p>{project.date}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Link to="/projects/new" className="btn btn-success">Create New Project</Link>
      </div>
    </div>
  );
}

export default ProjectList;