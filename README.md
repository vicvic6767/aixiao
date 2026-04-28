# 🐾 宠物救助志愿者发帖平台

一个完整的宠物救助志愿者社区平台，帮助流浪动物找到救助者。

## 🚀 快速启动

### 方式一：一键启动（推荐）
```bash
./start.sh
```

### 方式二：手动分别启动

**启动后端服务:**
```bash
cd backend
npm install
npm start
```
后端运行在: http://localhost:3000

**启动前端服务:**
```bash
cd frontend
npm install
npm run dev
```
前端运行在: http://localhost:5173

---

## 📋 测试账号

- **用户名**: `test`
- **密码**: `123456`

---

## 🛠️ 技术栈

### 前端
- ⚡ **Vite** - 下一代前端构建工具
- ⚛️ **React 18** - 现代化前端框架
- 🎨 **Tailwind CSS** - 原子化 CSS 框架
- 🧩 **Ant Design** - 企业级 UI 组件库
- 📡 **Axios** - HTTP 请求库
- 🚀 **React Router** - 前端路由

### 后端
- 🟢 **Node.js** - JavaScript 运行时
- 🚂 **Express** - 轻量级 Web 框架
- 🗄️ **SQLite3** - 嵌入式数据库
- 🔐 **JWT** - JSON Web Token 身份认证
- 🔑 **bcryptjs** - 密码加密
- 📷 **Multer** - 文件上传

---

## ✨ 功能特性

### 用户系统
- ✅ 用户注册 / 登录
- ✅ JWT 身份认证（7天有效期）
- ✅ 密码加密存储
- ✅ 个人信息管理

### 帖子系统
- ✅ 发布救助帖子（支持图片上传）
- ✅ 查看帖子列表与详情
- ✅ 帖子筛选（按宠物类型 / 状态）
- ✅ 编辑 / 删除自己的帖子
- ✅ 帖子状态管理（待救助 / 已救助）
- ✅ 支持最多3张图片上传
- ✅ 拖拽上传与图片预览

### UI 交互
- ✅ 响应式设计（适配手机 / 平板 / 电脑）
- ✅ 优雅的加载状态与错误提示
- ✅ 图片点击放大预览
- ✅ 导航栏根据登录状态动态显示
- ✅ 登录路由保护

---

## 📁 项目结构

```
angela-eagle-project-web/
├── backend/                # 后端服务
│   ├── routes/            # API 路由
│   │   ├── auth.js        # 用户认证接口
│   │   └── posts.js       # 帖子管理接口
│   ├── middleware/        # 中间件
│   │   └── auth.js        # JWT 认证中间件
│   ├── uploads/           # 上传图片存储目录
│   ├── server.js          # 服务器入口
│   ├── init-db.js         # 数据库初始化脚本
│   ├── package.json       # 后端依赖
│   └── pet-rescue.db      # SQLite 数据库文件
│
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 公共组件
│   │   ├── pages/         # 页面组件
│   │   ├── utils/         # 工具函数
│   │   ├── App.jsx        # 根组件
│   │   ├── main.jsx       # 应用入口
│   │   └── index.css      # 全局样式
│   ├── vite.config.js     # Vite 配置
│   └── package.json       # 前端依赖
│
├── start.sh               # 一键启动脚本
└── README.md              # 项目说明文档
```

---

## 🔌 API 接口说明

### 用户接口
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录（返回 Token）
- `GET /api/user/info` - 获取当前用户信息

### 帖子接口
- `GET /api/posts` - 获取帖子列表（支持筛选）
- `GET /api/posts/:id` - 获取帖子详情
- `POST /api/posts` - 发布新帖子
- `PUT /api/posts/:id` - 修改帖子
- `DELETE /api/posts/:id` - 删除帖子
- `PUT /api/posts/:id/status` - 修改帖子状态
- `POST /api/upload` - 图片上传接口

---

## 📝 开发说明

### 数据库设计
- **users 表**: 存储用户信息，密码使用 bcrypt 加密
- **posts 表**: 存储救助帖子信息，支持多图存储

### 安全特性
- 密码加密存储
- JWT 无状态认证
- 接口权限校验
- 文件上传格式与大小限制
- CORS 跨域配置

---

## 📱 页面说明

1. **首页** - 帖子列表，支持筛选功能
2. **登录页** - 用户登录界面
3. **注册页** - 新用户注册
4. **发布帖子页** - 发布新的救助信息
5. **帖子详情页** - 查看完整帖子信息，支持编辑删除

---

## ⚠️ 注意事项

- 上传图片限制: 单张最大 5MB，仅支持 jpg/jpeg/png 格式
- 帖子最多上传 3 张图片
- Token 有效期为 7 天，过期后需要重新登录