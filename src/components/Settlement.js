import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject, getSettlement } from '../services/api';

function Settlement() {
  const [project, setProject] = useState(null);
  const [settlement, setSettlement] = useState(null);
  const { projectId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectResponse = await getProject(projectId);
        setProject(projectResponse.data);
        const settlementResponse = await getSettlement(projectId);
        setSettlement(settlementResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [projectId]);

  if (!project || !settlement) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>{project.name} - 結算</h2>
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">結算計劃</h3>
          <ul className="list-group list-group-flush">
            {settlement.settlements.map((item, index) => (
              <li key={index} className="list-group-item">
                {item.payer} 應該支付 {item.receiver} ${item.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Link to={`/project/${projectId}`} className="btn btn-primary mt-3">
        返回專案詳情
      </Link>
    </div>
  );
}

export default Settlement;