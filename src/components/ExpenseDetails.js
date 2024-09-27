import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { getExpenseDetails, updateExpense, getUsers } from '../services/api';

function ExpenseDetails() {
  const [expense, setExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState([]);
  const { id } = useParams();
  const history = useHistory();

  useEffect(() => {
    if (id) {
      fetchExpenseDetails();
      fetchUsers();
    }
  }, [id]);

  const fetchExpenseDetails = async () => {
    try {
      const response = await getExpenseDetails(id);
      setExpense(response.data);
    } catch (error) {
      console.error('Error fetching expense details:', error);
      alert('無法獲取支出詳情，請稍後再試。');
      history.push('/home');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpense({ ...expense, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setExpense({ ...expense, paidFor: [...expense.paidFor, value] });
    } else {
      setExpense({ ...expense, paidFor: expense.paidFor.filter(user => user !== value) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateExpense(id, expense);
      alert('支出更新成功！');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('更新支出時發生錯誤，請稍後再試。');
    }
  };

  if (!expense) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="card shadow">
      <div className="card-body">
        <h2 className="card-title mb-4 text-success">支出詳情 (ID: {id})</h2>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">日期:</label>
              <input
                type="date"
                className="form-control"
                name="date"
                value={expense.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">類別:</label>
              <input
                type="text"
                className="form-control"
                name="category"
                value={expense.category}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">品項:</label>
              <input
                type="text"
                className="form-control"
                name="item"
                value={expense.item}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">金額:</label>
              <input
                type="number"
                className="form-control"
                name="amount"
                value={expense.amount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">付款人:</label>
              <select
                className="form-control"
                name="paidBy"
                value={expense.paidBy}
                onChange={handleInputChange}
                required
              >
                {users.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">分攤者:</label>
              {users.map(user => (
                <div key={`expense-detail-${id}-${user}`} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`expense-detail-${id}-user-${user}`}
                    value={user}
                    checked={expense.paidFor.includes(user)}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label" htmlFor={`expense-detail-${id}-user-${user}`}>
                    {user}
                  </label>
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-primary mt-3">保存更改</button>
            <button type="button" className="btn btn-secondary mt-3 ms-2" onClick={() => setIsEditing(false)}>取消</button>
          </form>
        ) : (
          <div className="row">
            <div className="col-12 col-md-6">
              <p className="card-text"><strong>日期:</strong> {expense.date}</p>
              <p className="card-text"><strong>類別:</strong> {expense.category}</p>
              <p className="card-text"><strong>品項:</strong> {expense.item}</p>
              <p className="card-text"><strong>金額:</strong> ${expense.amount.toFixed(2)}</p>
            </div>
            <div className="col-12 col-md-6">
              <p className="card-text"><strong>付款人:</strong> {expense.paidBy}</p>
              <p className="card-text"><strong>分攤者:</strong> {expense.paidFor.join(', ')}</p>
              <p className="card-text"><strong>每人應付:</strong> ${(expense.amount / expense.paidFor.length).toFixed(2)}</p>
            </div>
            <div className="col-12 mt-3">
              <button className="btn btn-primary me-2" onClick={() => setIsEditing(true)}>編輯</button>
              <Link to="/home" className="btn btn-secondary">返回首頁</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseDetails;