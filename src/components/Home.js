import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { getExpenses, addExpense, getUsers, updateExpense } from '../services/api';

function Home() {
  const history = useHistory();
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [newExpense, setNewExpense] = useState({
    item: '',
    amount: '',
    paidBy: '',
    paidFor: [],
    date: new Date().toISOString().split('T')[0],
    category: 'General'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchUsers();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await getExpenses();
      setExpenses(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
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

  const handleInputChange = (e, id = null) => {
    const { name, value } = e.target;
    if (id === null) {
      setNewExpense({ ...newExpense, [name]: value });
    } else {
      setExpenses(expenses.map(exp => 
        exp.id === id ? { ...exp, [name]: name === 'amount' ? parseFloat(value) : value } : exp
      ));
    }
  };

  const handleCheckboxChange = (e, id = null) => {
    const { value, checked } = e.target;
    if (id === null) {
      if (checked) {
        setNewExpense({ ...newExpense, paidFor: [...newExpense.paidFor, value] });
      } else {
        setNewExpense({ ...newExpense, paidFor: newExpense.paidFor.filter(user => user !== value) });
      }
    } else {
      setExpenses(expenses.map(exp => {
        if (exp.id === id) {
          const newPaidFor = checked
            ? [...exp.paidFor, value]
            : exp.paidFor.filter(user => user !== value);
          return { ...exp, paidFor: newPaidFor };
        }
        return exp;
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addExpense(newExpense);
      if (response.data.message === "Expense added successfully") {
        alert('支出新增成功！');
        setNewExpense({ item: '', amount: '', paidBy: '', paidFor: [], date: new Date().toISOString().split('T')[0], category: 'General' });
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('新增支出時發生錯誤，請稍後再試。');
    }
  };

  const handleEdit = (id) => {
    console.log('Editing expense with id:', id);
    setEditingId(id);
  };

  const handleSave = async (id) => {
    try {
      console.log('Saving expense with id:', id);
      const expenseToUpdate = expenses.find(exp => exp.id === id);
      if (!expenseToUpdate) {
        throw new Error('Expense not found');
      }
      await updateExpense(id, expenseToUpdate);
      setEditingId(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('更新支出時發生錯誤，請稍後再試。');
    }
  };

  const handleSettlement = () => {
    history.push('/settlement');
  };

  return (
    <div className="row">
      <div className="col-lg-4 mb-4">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title mb-4 text-success">新增支出</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  name="item"
                  value={newExpense.item}
                  onChange={handleInputChange}
                  placeholder="品項名稱"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  className="form-control"
                  name="amount"
                  value={newExpense.amount}
                  onChange={handleInputChange}
                  placeholder="金額"
                  required
                />
              </div>
              <div className="mb-3">
                <select
                  className="form-control"
                  name="paidBy"
                  value={newExpense.paidBy}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">選擇付款人</option>
                  {users.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label>分攤者：</label>
                {users.map(user => (
                  <div key={`new-expense-${user}`} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`new-expense-user-${user}`}
                      value={user}
                      checked={newExpense.paidFor.includes(user)}
                      onChange={handleCheckboxChange}
                    />
                    <label className="form-check-label" htmlFor={`new-expense-user-${user}`}>
                      {user}
                    </label>
                  </div>
                ))}
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-3">新增支出</button>
            </form>
          </div>
        </div>
      </div>
      <div className="col-lg-8 mb-4">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title mb-4 text-success">所有支出</h2>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>類別</th>
                    <th>品項</th>
                    <th>金額</th>
                    <th>付款人</th>
                    <th>分攤者</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={`expense-${expense.id}`} data-expense-id={expense.id}>
                      <td>
                        {editingId === expense.id ? (
                          <input
                            type="date"
                            className="form-control"
                            name="date"
                            value={expense.date}
                            onChange={(e) => handleInputChange(e, expense.id)}
                          />
                        ) : expense.date}
                      </td>
                      <td>
                        {editingId === expense.id ? (
                          <input
                            type="text"
                            className="form-control"
                            name="category"
                            value={expense.category}
                            onChange={(e) => handleInputChange(e, expense.id)}
                          />
                        ) : expense.category}
                      </td>
                      <td>
                        {editingId === expense.id ? (
                          <input
                            type="text"
                            className="form-control"
                            name="item"
                            value={expense.item}
                            onChange={(e) => handleInputChange(e, expense.id)}
                          />
                        ) : expense.item}
                      </td>
                      <td>
                        {editingId === expense.id ? (
                          <input
                            type="number"
                            className="form-control"
                            name="amount"
                            value={expense.amount}
                            onChange={(e) => handleInputChange(e, expense.id)}
                          />
                        ) : `$${expense.amount.toFixed(2)}`}
                      </td>
                      <td>
                        {editingId === expense.id ? (
                          <select
                            className="form-control"
                            name="paidBy"
                            value={expense.paidBy}
                            onChange={(e) => handleInputChange(e, expense.id)}
                          >
                            {users.map(user => (
                              <option key={user} value={user}>{user}</option>
                            ))}
                          </select>
                        ) : expense.paidBy}
                      </td>
                      <td>
                        {editingId === expense.id ? (
                          users.map(user => (
                            <div key={`edit-expense-${expense.id}-${user}`} className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`edit-expense-${expense.id}-user-${user}`}
                                value={user}
                                checked={expense.paidFor.includes(user)}
                                onChange={(e) => handleCheckboxChange(e, expense.id)}
                              />
                              <label className="form-check-label" htmlFor={`edit-expense-${expense.id}-user-${user}`}>
                                {user}
                              </label>
                            </div>
                          ))
                        ) : expense.paidFor.join(', ')}
                      </td>
                      <td>
                        {editingId === expense.id ? (
                          <button className="btn btn-success btn-sm" onClick={() => handleSave(expense.id)}>保存</button>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => handleEdit(expense.id)}>修改</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 mt-4">
        <button onClick={handleSettlement} className="btn btn-primary btn-lg">
          進行結算
        </button>
      </div>
    </div>
  );
}

export default Home;