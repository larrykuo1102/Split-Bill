import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createProject } from '../services/api';

function CreateProject() {
  const [newProject, setNewProject] = useState({ name: '', date: '' });
  const history = useHistory();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject(newProject);
      alert('Project created successfully!');
      history.push('/projects'); // 創建成功後返回專案列表
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Create New Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="projectName" className="form-label">Project Name</label>
          <input
            type="text"
            className="form-control"
            id="projectName"
            name="name"
            value={newProject.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="projectDate" className="form-label">Project Date</label>
          <input
            type="date"
            className="form-control"
            id="projectDate"
            name="date"
            value={newProject.date}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Project</button>
      </form>
    </div>
  );
}

export default CreateProject;