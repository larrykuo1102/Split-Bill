from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from collections import defaultdict
from typing import List, Optional
from datetime import datetime, timedelta, date
import jwt
from passlib.context import CryptContext

app = FastAPI(
    title="Expense Splitter API",
    description="API for splitting expenses among friends",
    version="1.0.0",
)

# 添加 CORS 中間件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允許前端應用的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 密碼加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 相關設置
SECRET_KEY = "your-secret-key"  # 請更換為安全的密鑰
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 數據庫設置
SQLALCHEMY_DATABASE_URL = "sqlite:///./expense_splitter.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 數據庫模型
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    payer = Column(String, index=True)
    amount = Column(Float)
    description = Column(String)
    participants = Column(String)  # 存儲為逗號分隔的字符串

Base.metadata.create_all(bind=engine)

# 模擬數據庫
users_db = {}
expenses_db = []

# 模型定義
class User(BaseModel):
    username: str
    password: str

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class Expense(BaseModel):
    id: Optional[int] = None
    project_id: int
    date: date
    category: str
    item: str
    amount: float
    paidBy: str
    paidFor: List[str]

# 用戶註冊
@app.post("/register")
async def register(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = pwd_context.hash(user.password)
    users_db[user.username] = UserInDB(**user.dict(), hashed_password=hashed_password)
    return {"message": "User registered successfully"}

# 驗證用戶
def authenticate_user(username: str, password: str):
    user = users_db.get(username)
    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user

# 創建訪問令牌
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 登入並獲取令牌
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# OAuth2 密碼承載令牌
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 獲取當前用戶
async def get_current_user(token: str = Depends(oauth2_scheme)):
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
        token_data = TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    user = users_db.get(token_data.username)
    if user is None:
        raise credentials_exception
    return user

# 添加支出
@app.post("/expenses")
async def add_expense(expense: Expense, current_user: User = Depends(get_current_user)):
    new_expense = expense.dict()
    new_expense['id'] = len(expenses_db) + 1  # 簡單的 id 生成方式
    expenses_db.append(new_expense)
    return {"message": "Expense added successfully", "expense": new_expense}

# 獲取所有支出
@app.get("/expenses")
async def get_expenses(project_id: Optional[int] = None, current_user: User = Depends(get_current_user)):
    if project_id:
        return [Expense(**expense) for expense in expenses_db if expense['project_id'] == project_id]
    return [Expense(**expense) for expense in expenses_db]

# 獲取結算信息
@app.get("/settlement/{project_id}")
async def get_settlement(project_id: int, current_user: User = Depends(get_current_user)):
    # 獲取特定 project 的支出
    project_expenses = [expense for expense in expenses_db if expense['project_id'] == project_id]
    
    # 創建一個字典來跟踪每個用戶的淨欠款
    balances = defaultdict(float)

    # 計算每個用戶的淨欠款
    for expense in project_expenses:
        payer = expense['paidBy']
        amount = expense['amount']
        participants = expense['paidFor']

        # 付款人增加餘額
        balances[payer] += amount

        # 參與者平均分攤費用
        share = amount / len(participants)
        for participant in participants:
            balances[participant] -= share

    # 將餘額分為正數（債權人）和負數（債務人）
    debtors = [(name, amount) for name, amount in balances.items() if amount < 0]
    creditors = [(name, amount) for name, amount in balances.items() if amount > 0]

    # 排序債務人和債權人（按絕對值從大到小）
    debtors.sort(key=lambda x: x[1])
    creditors.sort(key=lambda x: x[1], reverse=True)

    # 創建一個列表來存儲結算計劃
    settlement_plan = []

    # 進行結算
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

# 獲取支出摘要
@app.get("/summary")
async def get_summary(current_user: User = Depends(get_current_user)):
    total_expense = sum(expense.amount for expense in expenses_db)
    # 這裡應該計算當前用戶的淨欠款
    your_net_debt = 0  # 暫時設為0，需要實現實際的計算邏輯
    return {"totalExpense": total_expense, "yourNetDebt": your_net_debt}

# 獲取用戶列表
@app.get("/users")
async def get_users(current_user: User = Depends(get_current_user)):
    return list(users_db.keys())

# 獲取特定支出詳情
@app.get("/expenses/{expense_id}")
async def get_expense_details(expense_id: int, current_user: User = Depends(get_current_user)):
    expense = next((expense for expense in expenses_db if expense['id'] == expense_id), None)
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return Expense(**expense)

@app.put("/expenses/{expense_id}")
async def update_expense(expense_id: int, updated_expense: Expense, current_user: User = Depends(get_current_user)):
    for index, expense in enumerate(expenses_db):
        if expense['id'] == expense_id:
            updated_dict = updated_expense.dict(exclude_unset=True)
            updated_dict['id'] = expense_id  # 保持原有的 id
            expenses_db[index] = updated_dict
            return {"message": "Expense updated successfully", "expense": updated_dict}
    raise HTTPException(status_code=404, detail="Expense not found")

# Project model and API endpoints
class Project(BaseModel):
    id: Optional[int] = None
    name: str
    date: date
    description: Optional[str] = None

projects_db = []

@app.post("/projects")
async def create_project(project: Project, current_user: User = Depends(get_current_user)):
    new_project = project.dict()
    new_project['id'] = len(projects_db) + 1
    projects_db.append(new_project)
    return {"message": "Project created successfully", "project": new_project}

@app.get("/projects")
async def get_projects(current_user: User = Depends(get_current_user)):
    return projects_db

@app.get("/projects/{project_id}")
async def get_project(project_id: int, current_user: User = Depends(get_current_user)):
    project = next((p for p in projects_db if p['id'] == project_id), None)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)