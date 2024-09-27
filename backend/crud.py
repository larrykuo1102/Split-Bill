from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
from typing import List
from collections import defaultdict
import logging

import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "your-secret-key"  # 請更換為安全的密鑰
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

logger = logging.getLogger(__name__)

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    logger.info(f"Attempting to create user: {user.username}")
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"User {user.username} created successfully.")
        return db_user
    except Exception as e:
        logger.error(f"Error creating user {user.username}: {e}")
        db.rollback()
        raise

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    logger.info(f"Authenticating user: {username}")
    logger.info(f"User found: {user}")
    if not user:
        logger.warning(f"User not found: {username}")
        return False
    if not pwd_context.verify(password, user.hashed_password):
        logger.warning(f"Password verification failed for user: {username}")
        return False
    logger.info(f"Authentication successful for user: {username}")
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(db: Session, token: str):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    user = get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

def create_project(db: Session, project: schemas.ProjectCreate, user_id: str):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_projects(db: Session):
    return db.query(models.Project).all()

def get_project(db: Session, project_id: str):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def create_expense(db: Session, expense: schemas.ExpenseCreate):
    db_expense = models.Expense(**expense.dict(exclude={'paid_for'}), paid_for=','.join(expense.paid_for))
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return schemas.ExpenseResponse(**db_expense.__dict__, paid_for=db_expense.paid_for.split(','))

def get_expenses(db: Session, project_id: str = None):
    query = db.query(models.Expense)
    if project_id:
        query = query.filter(models.Expense.project_id == project_id)
    expenses = query.all()
    return [schemas.ExpenseResponse(**expense.__dict__, paid_for=expense.paid_for.split(',')) for expense in expenses]

def get_expense(db: Session, expense_id: int):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if expense:
        return schemas.ExpenseResponse(**expense.__dict__, paid_for=expense.paid_for.split(','))
    return None

def update_expense(db: Session, expense_id: int, expense: schemas.ExpenseCreate):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if db_expense is None:
        return None
    for key, value in expense.dict(exclude={'paid_for'}).items():
        setattr(db_expense, key, value)
    db_expense.paid_for = ','.join(expense.paid_for)
    db.commit()
    db.refresh(db_expense)
    return schemas.ExpenseResponse(**db_expense.__dict__, paid_for=db_expense.paid_for.split(','))

def get_project_settlement(db: Session, project_id: str):
    expenses = db.query(models.Expense).filter(models.Expense.project_id == project_id).all()
    
    balances = defaultdict(float)
    for expense in expenses:
        payer = expense.paid_by
        amount = expense.amount
        participants = expense.paid_for.split(',')

        balances[payer] += amount
        share = amount / len(participants)
        for participant in participants:
            balances[participant] -= share

    debtors = [(name, amount) for name, amount in balances.items() if amount < 0]
    creditors = [(name, amount) for name, amount in balances.items() if amount > 0]

    debtors.sort(key=lambda x: x[1])
    creditors.sort(key=lambda x: x[1], reverse=True)

    settlement_plan = []
    i, j = 0, 0
    while i < len(debtors) and j < len(creditors):
        debtor, debt = debtors[i]
        creditor, credit = creditors[j]
        amount = min(-debt, credit)
        
        settlement_plan.append({
            "from": debtor,
            "to": creditor,
            "amount": round(amount, 2)
        })

        debtors[i] = (debtor, debt + amount)
        creditors[j] = (creditor, credit - amount)

        if abs(debtors[i][1]) < 0.01:
            i += 1
        if abs(creditors[j][1]) < 0.01:
            j += 1

    return {
        "balances": dict(balances),
        "settlementPlan": settlement_plan
    }

def get_users(db: Session):
    users = db.query(models.User).all()
    return [user.username for user in users]