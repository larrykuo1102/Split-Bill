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
import uuid

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
    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    name = Column(String, index=True)
    date = Column(String)

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, ForeignKey('projects.id'))
    date = Column(String)
    category = Column(String)
    item = Column(String)
    amount = Column(Float)
    paid_by = Column(String)
    paid_for = Column(String)  # 存儲為逗號分隔的字符串

Base.metadata.create_all(bind=engine)

# Pydantic 模型
class UserCreate(BaseModel):
    username: str
    password: str

class UserInDB(BaseModel):
    id: str
    username: str
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ProjectCreate(BaseModel):
    name: str
    date: str

class ProjectResponse(BaseModel):
    id: str
    name: str
    date: str

class ExpenseCreate(BaseModel):
    project_id: str
    date: str
    category: str
    item: str
    amount: float
    paid_by: str
    paid_for: List[str]

class ExpenseResponse(BaseModel):
    id: int
    project_id: str
    date: str
    category: str
    item: str
    amount: float
    paid_by: str
    paid_for: List[str]

# 依賴項
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 用戶註冊
@app.post("/users/", response_model=UserInDB)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return UserInDB(id=db_user.id, username=db_user.username, hashed_password=db_user.hashed_password)

# 驗證用戶
def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
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
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
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
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
    user = get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# 創建項目
@app.post("/projects/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return ProjectResponse(**db_project.__dict__)

# 獲取項目列表
@app.get("/projects/", response_model=List[ProjectResponse])
async def get_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return [ProjectResponse(**project.__dict__) for project in projects]

# 獲取特定項目
@app.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse(**project.__dict__)

# 添加支出
@app.post("/expenses/", response_model=ExpenseResponse)
async def add_expense(expense: ExpenseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_expense = Expense(**expense.dict(exclude={'paid_for'}), paid_for=','.join(expense.paid_for))
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return ExpenseResponse(**db_expense.__dict__, paid_for=db_expense.paid_for.split(','))

# 獲取支出列表
@app.get("/expenses/", response_model=List[ExpenseResponse])
async def get_expenses(project_id: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Expense)
    if project_id:
        query = query.filter(Expense.project_id == project_id)
    expenses = query.all()
    return [ExpenseResponse(**expense.__dict__, paid_for=expense.paid_for.split(',')) for expense in expenses]

# 獲取特定支出
@app.get("/expenses/{expense_id}", response_model=ExpenseResponse)
async def get_expense_details(expense_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return ExpenseResponse(**expense.__dict__, paid_for=expense.paid_for.split(','))

# 更新支出
@app.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: int, expense: ExpenseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    for key, value in expense.dict(exclude={'paid_for'}).items():
        setattr(db_expense, key, value)
    db_expense.paid_for = ','.join(expense.paid_for)
    db.commit()
    db.refresh(db_expense)
    return ExpenseResponse(**db_expense.__dict__, paid_for=db_expense.paid_for.split(','))

# 獲取結算信息
@app.get("/projects/{project_id}/settlement")
async def get_settlement(project_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    expenses = db.query(Expense).filter(Expense.project_id == project_id).all()
    
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

# 獲取用戶列表
@app.get("/users/", response_model=List[str])
async def get_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [user.username for user in users]

# 輔助函數
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)