import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Grid, Paper, MenuItem, Snackbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
}));

const categories = [
  '食品', '交通', '娛樂', '住宿', '醫療', '教育', '其他',
];

function AddExpense() {
  const classes = useStyles();
  const history = useHistory();
  const [expense, setExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    paidBy: '',
    paidFor: [],
    description: '',
  });
  const [users, setUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setSnackbar({ open: true, message: '無法載入用戶列表' });
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/api/expenses', expense, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSnackbar({ open: true, message: '支出已成功添加' });
      setTimeout(() => history.push('/'), 2000);
    } catch (error) {
      console.error('Failed to add expense:', error);
      setSnackbar({ open: true, message: '添加支出失敗' });
    }
  };

  return (
    <Container className={classes.container} maxWidth="sm">
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          添加新支出
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            name="date"
            label="日期"
            type="date"
            value={expense.date}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            required
          />
          <TextField
            name="category"
            label="類別"
            select
            value={expense.category}
            onChange={handleChange}
            fullWidth
            required
          >
            {categories.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="amount"
            label="金額"
            type="number"
            value={expense.amount}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="paidBy"
            label="付款人"
            select
            value={expense.paidBy}
            onChange={handleChange}
            fullWidth
            required
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="paidFor"
            label="受益人"
            select
            value={expense.paidFor}
            onChange={handleChange}
            fullWidth
            required
            SelectProps={{
              multiple: true,
            }}
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="description"
            label="描述"
            multiline
            rows={4}
            value={expense.description}
            onChange={handleChange}
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submitButton}
            fullWidth
          >
            添加支出
          </Button>
        </form>
      </Paper>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}

export default AddExpense;