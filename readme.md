# Split Bill - 分帳應用

一個現代化的分帳應用，幫助朋友之間輕鬆管理共同支出。

## 主要功能

### 用戶管理
- [x] 註冊和登入：使用用戶名和密碼
- [x] 個人資料頁面：查看個人信息和統計數據
- [x] 登出功能：安全退出系統
- [x] JWT 認證：確保 API 安全

### 專案管理
- [x] 創建新專案：設置專案名稱和日期
- [x] 邀請碼系統：生成和使用邀請碼加入專案
- [x] 專案列表：查看所有參與的專案
- [x] 專案詳情：查看專案的所有支出和成員

### 支出管理
- [x] 添加支出：記錄支出項目、金額、付款人和分攤者
- [x] 支出列表：以表格形式顯示所有支出
- [x] 編輯支出：修改已添加的支出信息
- [x] 支出詳情：查看單筆支出的詳細信息

### 結算功能
- [x] 餘額計算：自動計算每個成員的收支情況
- [x] 智能結算：生成最優的轉帳方案
- [x] 結算詳情：清晰展示誰該付給誰多少錢

### 好友管理
- [x] 添加好友：通過用戶名添加好友
- [x] 好友列表：查看和管理好友關係
- [x] 好友驗證：防止重複添加和自我添加

### UI/UX 特點
- [x] 響應式設計：完美支持桌面和移動設備
- [x] 現代化界面：使用 Bootstrap 5 和自定義 CSS
- [x] 交互反饋：操作結果即時提示
- [x] 直觀導航：清晰的菜單結構和頁面佈局

## 技術棧

### 前端
- React 17+
- React Router v5
- Axios
- Bootstrap 5
- CSS3 (自定義樣式和動畫)

### 後端
- Python 3.8+
- FastAPI
- SQLAlchemy
- SQLite
- JWT 認證
- Uvicorn (ASGI 服務器)

## 安裝和運行

### 後端設置
1. 安裝 Python 依賴：
   ```bash
   pip install -r requirements.txt
   ```

2. 運行後端服務器：
   ```bash
   uvicorn main:app --reload
   ```

### 前端設置
1. 安裝 Node.js 依賴：
   ```bash
   npm install
   ```

2. 運行前端開發服務器：
   ```bash
   npm start
   ```

## API 文檔

### 用戶相關
- POST `/users/`: 註冊新用戶
- POST `/token`: 用戶登入
- GET `/users/`: 獲取用戶列表
- GET `/users/friends`: 獲取好友列表
- POST `/users/friends`: 添加好友

### 專案相關
- POST `/projects/`: 創建新專案
- GET `/projects/`: 獲取專案列表
- GET `/projects/{id}`: 獲取專案詳情
- POST `/projects/{id}/invite`: 生成邀請碼
- POST `/projects/{id}/join`: 加入專案

### 支出相關
- POST `/expenses/`: 添加支出
- GET `/expenses/`: 獲取支出列表
- GET `/expenses/{id}`: 獲取支出詳情
- PUT `/expenses/{id}`: 更新支出

### 結算相關
- GET `/projects/{id}/settlement`: 獲取結算信息

## 安全性考慮
- 使用 JWT 進行 API 認證
- 密碼加密存儲
- API 訪問權限控制
- 輸入驗證和清理

## 開發中的功能
- [ ] 支出分類和篩選
- [ ] 統計圖表
- [ ] 多語言支持
- [ ] 深色模式
- [ ] 即時通知
- [ ] 導出報表

## 注意事項
- 開發環境使用，生產環境部署前需要進行安全配置
- 建議定期備份數據庫
- API 密鑰和敏感設置需要妥善保管

## 貢獻指南
歡迎提交 Issue 和 Pull Request 來幫助改進項目。

## 授權
MIT License
