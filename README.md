# MyPaperManager - 智能文献管理系统

<div align="center">

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![Stack](https://img.shields.io/badge/stack-MERN-green)
![License](https://img.shields.io/badge/license-MIT-orange)

**一款专为科研人员设计的现代化个人文献管理系统**

深空探索主题 UI · 粒子动效背景 · AI 智能解析 · PDF 深色模式 · 多级目录管理

</div>

---

## 📖 项目简介

MyPaperManager 是一款基于 MERN 技术栈开发的个人文献管理系统，支持 PDF 智能解析、阅读标注、AI 翻译/摘要等功能。系统采用深空探索主题设计，提供沉浸式的科研阅读体验。

### ✨ 核心特性

| 功能模块 | 描述 |
|---------|------|
| 🤖 **AI 智能解析** | 基于 DeepSeek API 自动提取 PDF 元数据（标题、作者、摘要等） |
| 📚 **多级目录系统** | 支持无限层级的文献分类管理，可自定义颜色和图标 |
| ✍️ **PDF 阅读标注** | 支持高亮、笔记标注，数据持久化存储 |
| 🌐 **AI 翻译助手** | 选中文本一键翻译，支持全文摘要生成 |
| 📂 **自动重命名** | 基于模板（[Year] [Author] - [Title]）规范化文件命名 |
| 📎 **附件管理** | 为文献关联代码、Excel、补充材料等附件 |
| 📱 **响应式设计** | 完美适配桌面端和移动端设备 |
| 🎨 **科技感 UI** | 深空主题 + 粒子背景 + 毛玻璃效果 + Framer Motion 动画 |
| 🔍 **全局搜索** | 快速搜索文献标题和作者 |
| 🌓 **阅读模式切换** | PDF 阅读器支持深色/浅色模式切换 |
| 📋 **双视图模式** | 文献列表支持卡片视图和列表视图切换 |

---

## 🛠️ 技术栈

### 前端 (Frontend)

```
React 18          - 核心框架
Vite 5            - 构建工具
Ant Design 5      - UI 组件库
Framer Motion     - 动画引擎
react-pdf-highlighter - PDF 标注
react-resizable-panels - 可拖拽面板
pdfjs-dist 3.11.174 - PDF 渲染
Axios             - HTTP 客户端
React Router 6    - 路由管理
```

### 后端 (Backend)

```
Express 4         - Web 框架
MongoDB           - 数据库
Mongoose 8        - ODM
OpenAI SDK        - DeepSeek AI 集成
multer            - 文件上传
pdf-parse         - PDF 文本提取
bcryptjs          - 密码加密
jsonwebtoken      - JWT 认证
```

---

## 📁 项目结构

```bash
MyPaperManager/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB 连接配置
│   │   └── index.js             # 全局配置（端口、JWT、AI等）
│   ├── controllers/
│   │   ├── aiController.js      # AI 翻译/摘要
│   │   ├── annotationController.js  # 标注管理
│   │   ├── authController.js    # 用户认证
│   │   ├── collectionController.js  # 目录管理
│   │   ├── documentController.js    # 文献 CRUD
│   │   ├── noteController.js    # 笔记管理
│   │   ├── uploadController.js  # 文件上传
│   │   └── userController.js    # 用户管理
│   ├── middleware/
│   │   ├── auth.js              # JWT 认证中间件
│   │   └── upload.js            # Multer 上传配置
│   ├── models/
│   │   ├── Annotation.js        # 标注模型
│   │   ├── Collection.js        # 目录模型
│   │   ├── Document.js          # 文献模型
│   │   ├── Note.js              # 笔记模型
│   │   └── User.js              # 用户模型
│   ├── routes/                  # API 路由定义
│   ├── services/
│   │   └── aiService.js         # DeepSeek AI 服务
│   ├── public/uploads/          # 📂 文件存储目录
│   ├── server.js                # 入口文件
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── pdf.worker.min.js    # ⚠️ PDF.js Worker（版本必须匹配）
│   ├── src/
│   │   ├── components/
│   │   │   ├── animations/
│   │   │   │   └── index.jsx        # 动画组件（含粒子背景）
│   │   │   ├── CollectionTree.jsx   # 目录树组件
│   │   │   ├── DocumentList.jsx     # 文献列表（卡片/列表双视图）
│   │   │   ├── MainLayout.jsx       # 主布局（含搜索、通知、统计）
│   │   │   └── SettingsModal.jsx    # 设置弹窗
│   │   ├── hooks/
│   │   │   └── useBreakpoint.js     # 响应式 Hook
│   │   ├── pages/
│   │   │   ├── FavoritesPage.jsx    # 收藏页
│   │   │   ├── LibraryPage.jsx      # 文献库（主页）
│   │   │   ├── LoginPage.jsx        # 登录页
│   │   │   ├── PDFReaderPage.jsx    # PDF 阅读器
│   │   │   └── ProfilePage.jsx      # 个人中心
│   │   ├── services/            # API 服务封装
│   │   ├── styles/
│   │   │   └── theme.css        # 深空主题样式
│   │   ├── App.jsx              # 路由配置
│   │   └── main.jsx             # 入口文件
│   ├── vite.config.js
│   └── package.json
│
├── README.md                    # 项目说明
└── Plan.md                      # 📋 升级计划
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 16.x
- MongoDB >= 5.x（本地或 MongoDB Atlas）
- npm >= 8.x

### 1. 克隆项目

```bash
git clone <repository-url>
cd MyPaperManager
```

### 2. 配置环境变量

在 `backend/` 目录下创建 `.env` 文件：

```env
# 服务器配置
PORT=3000

# 数据库配置
MONGO_URI=mongodb://localhost:27017/literature-management-system

# JWT 配置
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_PATH=./public/uploads
MAX_FILE_SIZE=52428800

# AI 配置（DeepSeek）
DEEPSEEK_API_KEY=your-deepseek-api-key
```

### 3. 启动后端服务

```bash
cd backend
npm install
npm start        # 生产模式
# 或
npm run dev      # 开发模式（支持热重载）
```

后端运行于 `http://localhost:3000`

### 4. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端运行于 `http://localhost:3001`

### 5. 访问应用

打开浏览器访问 `http://localhost:3001`，注册账号后即可开始使用。

---

## 📡 API 文档

### 认证相关

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |

### 文献管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/documents` | 获取文献列表 |
| POST | `/api/documents` | 创建文献记录 |
| GET | `/api/documents/:id` | 获取文献详情 |
| PUT | `/api/documents/:id` | 更新文献信息 |
| DELETE | `/api/documents/:id` | 删除文献 |
| POST | `/api/documents/:id/favorite` | 切换收藏状态 |
| PATCH | `/api/documents/:id/move` | 移动到目录 |
| PATCH | `/api/documents/:id/rename` | 自动重命名 |
| POST | `/api/documents/:id/attachments` | 上传附件 |
| DELETE | `/api/documents/:id/attachments/:attId` | 删除附件 |
| PATCH | `/api/documents/batch/move` | 批量移动 |

### 目录管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/collections` | 获取目录树 |
| POST | `/api/collections` | 创建目录 |
| PUT | `/api/collections/:id` | 更新目录 |
| DELETE | `/api/collections/:id` | 删除目录 |

### 标注管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/annotations/:documentId` | 获取文献标注 |
| POST | `/api/annotations` | 保存标注 |
| DELETE | `/api/annotations/:id` | 删除标注 |

### AI 功能

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/upload/parse-pdf` | 上传并 AI 解析 PDF |
| POST | `/api/ai/translate` | AI 翻译 |
| POST | `/api/ai/summarize` | AI 摘要 |

### 文件服务

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/files/:filename` | 获取 PDF 文件 |

---

## ⚠️ 关键技术修复记录

> 以下问题已解决，请在后续开发中避免回退。

### 1. PDF 无限加载问题

**问题**：`pdfjs-dist` 主线程与 Worker 版本不匹配导致死锁。

**解决方案**：
- 将 `pdf.worker.min.js`（v3.11.174）放入 `frontend/public/`
- 在 `PDFReaderPage.jsx` 中强制指定本地 Worker：

```javascript
pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;
```

**⚠️ 约束**：升级 `pdfjs-dist` 版本时必须同步更新 Worker 文件。

### 2. PDF 跨域 404 问题

**问题**：前端（3001）无法访问后端（3000）的 PDF 文件。

**解决方案**：
- 在 `documentService.js` 中硬编码后端地址：

```javascript
const API_BASE_URL = 'http://localhost:3000';
pdfUrl: doc.filename ? `${API_BASE_URL}/api/files/${doc.filename}` : doc.pdfUrl
```

### 3. 上传文件名丢失

**问题**：上传后 `filename` 字段为 `undefined`。

**解决方案**：
- 修复 `LibraryPage.jsx` 中的状态管理
- 在 `Document.js` Schema 中添加 `filename` 字段

### 4. moveCollection 404 错误

**问题**：移动目录时返回 404，因为前端使用 `PUT` 但后端定义为 `PATCH`。

**解决方案**：
- 在 `collectionService.js` 中将 `api.put` 改为 `api.patch`

### 5. Ant Design 控制台警告

**问题**：多个 Ant Design 组件警告。

**解决方案**：
- Select options 的 `value: null` 改为 `value: ''`
- ColorPicker 的 `defaultValue` 改为 Form.Item 的 `initialValue`
- 静态 message 函数警告（已知限制，不影响功能）

### 6. animations/index.js JSX 报错

**问题**：动画文件包含 JSX 但使用 `.js` 扩展名。

**解决方案**：
- 将 `frontend/src/components/animations/index.js` 重命名为 `index.jsx`

---

## 🎨 UI 主题说明

系统采用 **深空探索主题**（Deep Space Theme），核心设计元素：

| 元素 | 配色/效果 |
|------|----------|
| 主背景 | `#0a0f1a` → `#1a2332` 渐变 |
| 强调色 | `#00d4ff`（科技青） |
| 成功色 | `#00ff88`（脉冲绿） |
| 毛玻璃 | `backdrop-filter: blur(20px)` |
| 发光效果 | `box-shadow: 0 0 20px rgba(0, 212, 255, 0.3)` |
| 粒子背景 | 悬浮粒子 + 光晕动画（ParticleBackground 组件） |
| PDF 深色 | `filter: invert(0.9) hue-rotate(180deg)` 实现暗色反转 |

主题变量定义在 `frontend/src/styles/theme.css`。

### 新增 UI 组件

| 组件 | 位置 | 功能 |
|------|------|------|
| 粒子背景 | 全局 | 50+ 悬浮粒子 + 大型光晕动效 |
| 搜索按钮 | 顶栏 | 点击弹出文献搜索模态框 |
| 通知铃铛 | 顶栏 | 显示未读通知数量（Badge） |
| 今日阅读 | 左侧栏底部 | 阅读篇数/时长统计卡片 |
| 视图切换 | 文献列表 | Segmented 切换卡片/列表视图 |
| 折叠上传 | 文献库 | 点击展开的 PDF 上传区域 |
| 深色开关 | PDF 阅读器 | Switch 切换深色/浅色阅读模式 |

---

## 📋 版本历史

### v2.1.0 (2024-12-24)
- ✅ **粒子背景动效** - 全局粒子动画和光晕效果
- ✅ **PDF 深色模式** - 阅读器支持深色/浅色模式切换
- ✅ **可完全折叠面板** - PDF 阅读器侧栏可拖拽完全折叠
- ✅ **双视图模式** - 文献列表支持卡片/列表视图切换
- ✅ **可折叠上传区** - PDF 上传区域收纳为紧凑按钮
- ✅ **全局搜索功能** - 顶栏搜索按钮支持文献搜索
- ✅ **通知中心** - 顶栏添加通知铃铛组件
- ✅ **今日阅读统计** - 左侧栏底部添加阅读统计卡片
- ✅ **UI 细节优化** - 目录树居中、滚动条优化、布局高度修复
- ✅ **Bug 修复** - 修复 moveCollection API、Ant Design 警告

### v2.0.0 (2024-12)
- ✅ 科技感 UI 主题系统
- ✅ Framer Motion 动画
- ✅ 移动端响应式适配
- ✅ 多级目录系统
- ✅ PDF 自动重命名
- ✅ 附件管理
- ✅ 批量操作

### v1.0.0 (2024-11)
- ✅ 基础文献管理
- ✅ PDF 阅读与标注
- ✅ 用户认证系统
- ✅ AI 元数据解析

---

## 🗺️ 路线图

详见 [Plan.md](./Plan.md) 获取完整的升级计划。

**最近完成（v2.1.0）：**
- ✅ 粒子背景动效系统
- ✅ PDF 阅读器深色模式
- ✅ 文献列表双视图切换
- ✅ 可完全折叠的侧边栏面板

**下一阶段预告：**
- 🔮 智能分组（Smart Groups）
- 📊 文献计量分析
- 📡 RSS 订阅
- 🔗 知识图谱

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**Made with ❤️ for Researchers**

</div>
