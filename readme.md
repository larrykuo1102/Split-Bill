# Expense Splitter Web App

This is a web application for splitting expenses, ideal for friends traveling together or sharing living costs.

## Features

### Frontend (React)

1. User Registration and Login
   - New users can register an account
   - Existing users can log in

2. Expense Management
   - Add Expense: Record item name, amount, payer, and participants
   - View All Expenses: Display all expense records in a table format
   - Edit Expense: Modify expense details directly in the table
   - Expense Details: View detailed information for each expense, including the amount owed by each person

3. Settlement
   - View Total Balance: Display the balance for each user
   - View Detailed Settlement Plan: Show the optimal transfer plan to minimize the number of transactions

### Backend (FastAPI)

1. User Management
   - User Registration API
   - User Login and Token Generation API

2. Expense Management
   - Add Expense API
   - Get All Expenses API
   - Get Specific Expense Details API
   - Update Expense API

3. Settlement
   - Get Settlement Information API: Calculate net debt for each user and optimal transfer plan

4. Others
   - Get User List API
   - CORS Middleware: Allow cross-origin requests from the frontend

## Tech Stack

- Frontend: React, JavaScript, Bootstrap
- Backend: Python, FastAPI
- Database: SQLite (via SQLAlchemy ORM)
- Authentication: JWT (JSON Web Tokens)

## Planned Features

- Expense categorization and filtering
- Statistical charts
- Multi-language support
- Mobile responsiveness optimization
- Project-based expense tracking and settlement

## How to Run

1. Backend:
   ```uvicorn main:app --reload```

2. Frontend:
   ```npm start```

Make sure all necessary dependencies are installed.

## Notes

- This application is currently in the development stage. Do not use in a production environment.
- Please ensure to change the JWT secret key and other sensitive settings before use.
