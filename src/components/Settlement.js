import React, { useState, useEffect } from 'react';
import { getSettlement } from '../services/api';

function Settlement() {
  const [settlement, setSettlement] = useState([]);
  const [balances, setBalances] = useState({});

  useEffect(() => {
    fetchSettlement();
  }, []);

  const fetchSettlement = async () => {
    try {
      const response = await getSettlement();
      setSettlement(response.data.settlementPlan);
      setBalances(response.data.balances);
    } catch (error) {
      console.error('Error fetching settlement:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title mb-4">結算計劃</h2>
        
        {/* 總收支情況 */}
        <h3>總收支情況</h3>
        <div className="table-responsive mb-4">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>用戶</th>
                <th>收支情況</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(balances).map(([user, amount]) => (
                <tr key={user}>
                  <td>{user}</td>
                  <td className={amount >= 0 ? 'text-success' : 'text-danger'}>
                    {amount >= 0 ? `可以收到 $${amount.toFixed(2)}` : `需要支付 $${(-amount).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 詳細結算計劃 */}
        <h3>詳細結算計劃</h3>
        {settlement.length === 0 ? (
          <p className="card-text">目前沒有需要結算的款項。</p>
        ) : (
          <div>
            <p>為了最小化交易次數，請按照以下計劃進行結算：</p>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>付款人</th>
                    <th>收款人</th>
                    <th>金額</th>
                  </tr>
                </thead>
                <tbody>
                  {settlement.map((item, index) => (
                    <tr key={index}>
                      <td>{item.from}</td>
                      <td>{item.to}</td>
                      <td>${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              按照此計劃進行結算後，所有債務將被清償，且交易次數最少。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settlement;