from pydantic import BaseModel
from typing import List, Optional

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