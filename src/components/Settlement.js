import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSettlement, getProject } from '../services/api';
import './Settlement.css'; // 確保創建了這個 CSS 文件

function Settlement() {
  const { projectId } = useParams();
  const [settlement, setSettlement] = useState(null);
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetchSettlement();
    fetchProject();
  }, [projectId]);

  const fetchSettlement = async () => {
    try {
      const response = await getSettlement(projectId);
      setSettlement(response.data);
    } catch (error) {
      console.error('Error fetching settlement:', error);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await getProject(projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  if (!settlement || !project) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">{project.name} - Settlement</h2>
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">Balances</h3>
              <ul className="list-group list-group-flush">
                {Object.entries(settlement.balances).map(([user, balance]) => (
                  <li key={user} className="list-group-item d-flex justify-content-between align-items-center">
                    {user}
                    <span className={`badge ${balance >= 0 ? 'bg-success' : 'bg-danger'} rounded-pill`}>
                      ${balance.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">Settlement Plan</h3>
              <ul className="list-group list-group-flush">
                {settlement.settlementPlan.map((transfer, index) => (
                  <li key={index} className="list-group-item">
                    {transfer.from} pays {transfer.to} ${transfer.amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Link to={`/project/${projectId}`} className="btn btn-primary">Back to Project</Link>
      </div>
    </div>
  );
}

export default Settlement;