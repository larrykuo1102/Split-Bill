from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import logging

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from database import SessionLocal, engine
import models, schemas, crud

# 創建數據庫表
try:
    logger.info("Attempting to create database tables...")
    models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")
    raise

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

# OAuth2 密碼承載令牌
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 依賴項
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 用戶註冊
@app.post("/users/", response_model=schemas.UserInDB)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

# 登入並獲取令牌
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = crud.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

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
        token_data = schemas.TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# 創建項目
@app.post("/projects/", response_model=schemas.ProjectResponse)
async def create_project(project: schemas.ProjectCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_project(db=db, project=project, user_id=current_user.id)

# 獲取項目列表
@app.get("/projects/", response_model=List[schemas.ProjectResponse])
async def get_projects(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_projects(db=db)

# 獲取特定項目
@app.get("/projects/{project_id}", response_model=schemas.ProjectResponse)
async def get_project(project_id: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = crud.get_project(db=db, project_id=project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# 添加支出
@app.post("/expenses/", response_model=schemas.ExpenseResponse)
async def add_expense(expense: schemas.ExpenseCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_expense(db=db, expense=expense)

# 獲取支出列表
@app.get("/expenses/", response_model=List[schemas.ExpenseResponse])
async def get_expenses(project_id: Optional[str] = None, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_expenses(db=db, project_id=project_id)

# 獲取特定支出
@app.get("/expenses/{expense_id}", response_model=schemas.ExpenseResponse)
async def get_expense_details(expense_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    expense = crud.get_expense(db=db, expense_id=expense_id)
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

# 更新支出
@app.put("/expenses/{expense_id}", response_model=schemas.ExpenseResponse)
async def update_expense(expense_id: int, expense: schemas.ExpenseCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    updated_expense = crud.update_expense(db=db, expense_id=expense_id, expense=expense)
    if updated_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return updated_expense

# 獲取結算信息
@app.get("/projects/{project_id}/settlement")
async def get_settlement(project_id: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_project_settlement(db=db, project_id=project_id)

# 獲取用戶列表
@app.get("/users/", response_model=List[str])
async def get_users(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_users(db=db)

# 獲取用戶狀態
@app.get("/check_user/{username}")
async def check_user(username: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username)
    if user:
        return {"message": f"User {username} exists", "id": user.id}
    else:
        return {"message": f"User {username} does not exist"}

# 新增用戶檢查端點
@app.get("/debug/users")
async def debug_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [{"id": user.id, "username": user.username} for user in users]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)