from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base
import uuid

def generate_uuid():
    return uuid.uuid4().hex

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, default=generate_uuid)
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

# 如果需要 Friend 模型，可以添加如下：
class Friend(Base):
    __tablename__ = "friends"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey('users.id'))
    friend_id = Column(String, ForeignKey('users.id'))