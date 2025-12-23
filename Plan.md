# MyPaperManager 升级计划

<div align="center">

📋 **项目演进路线图** 📋

*最后更新：2024年12月24日*

</div>

---

## 📊 当前进度总览

| 阶段 | 名称 | 状态 | 完成度 |
|:----:|------|:----:|:------:|
| 一 | 交互体验与移动端适配 | ✅ 已完成 | 100% |
| 1.5 | UI 增强与体验优化 | ✅ 已完成 | 100% |
| 二 | 核心数据管理 | ✅ 已完成 | 100% |
| 三 | 高级自动化与可视化 | 🔄 规划中 | 0% |
| 四 | 协作与云端同步 | 📝 待定 | 0% |
| 五 | 插件生态系统 | 📝 待定 | 0% |

---

## ✅ 阶段一：交互体验与移动端适配（已完成）

### 1.1 科技感 UI 主题系统
- [x] 深空探索主题配色（#0a0f1a → #1a2332）
- [x] CSS 变量系统（theme.css）
- [x] 毛玻璃效果（backdrop-filter）
- [x] 发光/霓虹边框效果
- [x] 自定义滚动条样式
- [x] Ant Design 主题覆盖

### 1.2 动画系统 (Framer Motion)
- [x] 页面切换过渡动画
- [x] 卡片列表交错入场
- [x] 按钮悬浮缩放效果
- [x] Logo 脉冲发光动画
- [x] 上传区域浮动动画

### 1.3 可拖拽侧边栏 (PDF阅读器)
- [x] react-resizable-panels 集成
- [x] 拖拽调整侧边栏宽度
- [x] 一键折叠/展开按钮
- [x] 拖拽手柄视觉反馈

### 1.4 移动端响应式适配
- [x] useBreakpoint Hook 实现
- [x] 移动端汉堡菜单
- [x] 抽屉式侧边栏
- [x] PDF阅读器移动端抽屉面板
- [x] 卡片网格自适应布局

---

## ✅ 阶段 1.5：UI 增强与体验优化（已完成 - 2024-12-24）

> **完成日期**：2024年12月24日

### 1.5.1 视觉效果增强
- [x] **粒子背景系统** (ParticleBackground 组件)
  - 50+ 悬浮粒子动画
  - 大型光晕效果（科技青/脉冲绿）
  - 性能优化（useMemo 缓存粒子配置）
- [x] **顶栏小组件**
  - 搜索按钮（SearchOutlined）+ 搜索模态框
  - 通知铃铛（BellOutlined）+ 未读 Badge
  - 视觉分隔线
- [x] **侧栏底部装饰**
  - 今日阅读统计卡片（篇数/时长）
  - 动态数字脉冲动画
  - 励志语录区域

### 1.5.2 文献库页面优化
- [x] **可折叠上传区域**
  - 默认显示紧凑上传按钮
  - 点击展开完整拖拽区域
  - AnimatePresence 平滑过渡
- [x] **双视图模式**
  - Segmented 组件切换（卡片/列表）
  - 列表视图 DocumentListItem 组件
  - 视图状态持久化
- [x] **布局修复**
  - 目录树卡片居中对齐
  - 目录区域高度延伸到底部
  - 右侧文献列表滚动条

### 1.5.3 PDF 阅读器增强
- [x] **完全可折叠面板**
  - react-resizable-panels collapsible 支持
  - 左拖可隐藏 PDF 只显示侧栏
  - 右拖可隐藏侧栏只显示 PDF
- [x] **深色阅读模式**
  - Switch 开关切换
  - CSS filter: invert(0.9) hue-rotate(180deg)
  - 深色模式背景 #1a1a1a
  - 浅色模式背景 #f0f2f5

### 1.5.4 Bug 修复
- [x] **moveCollection 404 错误**
  - collectionService.js: api.put → api.patch
- [x] **Ant Design 警告**
  - Select value: null → ''
  - ColorPicker defaultValue → Form.Item initialValue
- [x] **JSX 文件扩展名**
  - animations/index.js → index.jsx

---

## ✅ 阶段二：核心数据管理（已完成）

### 2.1 多级目录系统 (Collections)

**后端实现：**
- [x] Collection Schema 设计
  - name, parentId, owner, order
  - icon, color, description
- [x] Document Schema 添加 collectionId
- [x] 完整 CRUD API
- [x] 目录树结构查询
- [x] 级联删除逻辑

**前端实现：**
- [x] CollectionTree 组件
- [x] 树形目录展示
- [x] 右键菜单操作
- [x] 目录颜色自定义
- [x] LibraryPage 目录过滤集成

### 2.2 PDF 自动重命名
- [x] PATCH /api/documents/:id/rename 接口
- [x] 模板系统：[Year], [Author], [Title]
- [x] 物理文件重命名
- [x] 文件名冲突处理（添加时间戳）
- [x] 非法字符过滤

### 2.3 附件管理
- [x] Document Schema attachments 数组
- [x] 上传附件 API
- [x] 删除附件 API
- [x] 多格式支持（代码、Excel、PPT等）

### 2.4 批量操作
- [x] PATCH /api/documents/batch/move
- [x] 批量移动到指定目录

---

## 🔄 阶段三：高级自动化与可视化（规划中）

> **预计周期**：4-6 周  
> **优先级**：高

### 3.1 智能分组 (Smart Groups)

**目标**：基于条件自动聚合文献，类似 iTunes 智能播放列表。

**后端任务：**
- [ ] SmartGroup Schema 设计
  ```javascript
  {
    name: String,
    owner: ObjectId,
    conditions: [{
      field: String,      // 'year', 'authors', 'tags', 'status', 'journal'
      operator: String,   // 'equals', 'contains', 'gt', 'lt', 'between'
      value: Mixed
    }],
    logic: String,        // 'AND' | 'OR'
    sortBy: String,
    sortOrder: Number
  }
  ```
- [ ] 动态查询引擎实现
- [ ] CRUD API：GET/POST/PUT/DELETE /api/smart-groups
- [ ] 实时计数 API

**前端任务：**
- [ ] SmartGroupBuilder 可视化条件构建器
- [ ] 条件卡片拖拽排序
- [ ] 实时预览匹配结果
- [ ] 侧边栏智能分组列表

**预设智能分组：**
- [ ] 近7天添加
- [ ] 本月未读
- [ ] 高分文献（评分≥4）
- [ ] 缺少摘要

---

### 3.2 文献计量分析 (Analytics Dashboard)

**目标**：提供文献库的可视化统计分析。

**技术选型：**
- 图表库：ECharts 或 Recharts
- 可选：D3.js（高级定制）

**前端任务：**
- [ ] AnalyticsPage 新页面
- [ ] 年度发表趋势折线图
- [ ] 期刊分布饼图/环形图
- [ ] 作者共现网络图
- [ ] 关键词词云
- [ ] 阅读状态统计仪表盘
- [ ] 时间范围筛选器
- [ ] 导出图表为图片

**后端任务：**
- [ ] GET /api/analytics/yearly-trend
- [ ] GET /api/analytics/journal-distribution
- [ ] GET /api/analytics/author-stats
- [ ] GET /api/analytics/keyword-cloud
- [ ] GET /api/analytics/reading-status

---

### 3.3 RSS 订阅 (Feed Subscriptions)

**目标**：订阅期刊/ArXiv RSS，自动获取新文献。

**后端任务：**
- [ ] Feed Schema 设计
  ```javascript
  {
    name: String,
    url: String,
    owner: ObjectId,
    category: String,
    lastFetched: Date,
    fetchInterval: Number,  // 小时
    isActive: Boolean
  }
  ```
- [ ] FeedItem Schema（缓存条目）
- [ ] RSS 解析服务（rss-parser 库）
- [ ] 定时任务（node-cron）
- [ ] CRUD API：/api/feeds
- [ ] GET /api/feeds/:id/items

**前端任务：**
- [ ] FeedsPage 订阅管理页
- [ ] 添加订阅表单（URL 输入）
- [ ] 订阅列表管理
- [ ] 文章预览列表
- [ ] 一键导入到文献库
- [ ] 未读条目标记

**预设订阅源：**
- [ ] ArXiv CS 分类
- [ ] Nature
- [ ] Science
- [ ] PubMed 热门

---

### 3.4 引用格式导出

**目标**：一键导出多种引用格式。

**任务列表：**
- [ ] 引用格式引擎（citation-js 库）
- [ ] 支持格式：
  - [ ] BibTeX
  - [ ] APA
  - [ ] MLA
  - [ ] Chicago
  - [ ] GB/T 7714（中文国标）
- [ ] POST /api/documents/:id/cite?format=bibtex
- [ ] 批量导出 API
- [ ] 前端复制到剪贴板
- [ ] 下载 .bib 文件

---

## 📝 阶段四：协作与云端同步（待定）

> **预计周期**：6-8 周  
> **优先级**：中

### 4.1 团队协作

- [ ] Team Schema（团队模型）
- [ ] 成员邀请/移除
- [ ] 角色权限：Owner / Admin / Member / Viewer
- [ ] 共享目录功能
- [ ] 文献评论系统
- [ ] @提及通知
- [ ] 活动日志审计

### 4.2 云端同步

- [ ] WebDAV 同步支持
- [ ] 坚果云 / Dropbox / OneDrive 集成
- [ ] 冲突检测与合并
- [ ] 增量同步算法
- [ ] 离线模式 + Service Worker
- [ ] 多设备同步状态

### 4.3 分享与发布

- [ ] 公开阅读列表（只读分享）
- [ ] 短链生成
- [ ] 密码保护
- [ ] 过期时间设置
- [ ] 访问统计

---

## 📝 阶段五：插件生态系统（待定）

> **预计周期**：8-10 周  
> **优先级**：低

### 5.1 浏览器插件

- [ ] Chrome/Edge 扩展
- [ ] 一键保存网页 PDF
- [ ] DOI 快速导入
- [ ] 元数据自动填充
- [ ] 与桌面端同步

### 5.2 桌面客户端

- [ ] Electron 封装
- [ ] 系统托盘常驻
- [ ] 全局快捷键
- [ ] 本地文件监控
- [ ] 离线完整功能

### 5.3 Zotero 兼容

- [ ] Zotero 导入/导出
- [ ] RDF 格式支持
- [ ] 双向同步实验性支持

---

## 🐛 已知问题与技术债务

### 已修复 (2024-12-24)

| 问题 | 描述 | 修复方案 |
|------|------|----------|
| ~~moveCollection 404~~ | 前端使用 PUT 但后端定义 PATCH | ✅ collectionService.js 修改为 api.patch |
| ~~Select value null 警告~~ | Ant Design Select 不支持 null 值 | ✅ 改为空字符串 '' |
| ~~ColorPicker defaultValue~~ | 受控组件不应使用 defaultValue | ✅ 改用 Form.Item initialValue |
| ~~JSX 文件扩展名~~ | animations/index.js 包含 JSX | ✅ 重命名为 index.jsx |
| ~~无深色/浅色切换~~ | PDF 阅读器仅深色 | ✅ 添加 Switch 切换 + CSS filter |

### 高优先级

| 问题 | 描述 | 建议方案 |
|------|------|----------|
| PDF.js Worker 版本耦合 | 升级 pdfjs-dist 需手动同步 worker 文件 | 考虑 CDN fallback 或自动化脚本 |
| 硬编码后端地址 | documentService.js 中 localhost:3000 | 使用环境变量 + Vite define |
| AI 服务单一 | 仅支持 DeepSeek | 抽象 AI Provider 接口 |

### 中优先级

| 问题 | 描述 | 建议方案 |
|------|------|----------|
| 缺少单元测试 | 前后端均无测试覆盖 | Jest + React Testing Library |
| 无错误边界 | 组件崩溃导致白屏 | 添加 ErrorBoundary 组件 |
| 日志系统简陋 | 仅 console.log | 集成 winston / pino |

### 低优先级

| 问题 | 描述 | 建议方案 |
|------|------|----------|
| 国际化缺失 | 仅支持中文 | react-i18next |
| 图片附件预览 | 不支持图片预览 | lightbox 组件 |

---

## 🔧 技术优化建议

### 性能优化

1. **虚拟列表**
   - 文献列表超过 100 项时使用 react-window
   - 预计提升滚动性能 80%

2. **图片懒加载**
   - PDF 缩略图按需加载
   - 使用 Intersection Observer

3. **API 缓存**
   - 引入 React Query / SWR
   - 减少重复请求
   - 乐观更新提升体验

4. **代码分割**
   - PDF 阅读器按需加载
   - 路由级别 lazy loading

### 安全加固

1. **输入验证**
   - 后端增加 Joi/Zod 校验
   - 前端表单增强校验

2. **文件安全**
   - PDF 病毒扫描（ClamAV）
   - 文件类型严格校验
   - 上传大小限制提示

3. **认证增强**
   - Refresh Token 机制
   - 登录设备管理
   - 可选 2FA

### 开发体验

1. **TypeScript 迁移**
   - 后端：Express + TypeScript
   - 前端：TSX 重构
   - 渐进式迁移策略

2. **API 文档**
   - Swagger/OpenAPI 集成
   - 自动生成接口文档

3. **CI/CD**
   - GitHub Actions 配置
   - 自动化测试 + 部署

---

## 📅 里程碑时间线

```
2024年12月 ────────────────────────────────────────────────────
            │
            ├── 阶段一、二完成 ✅
            │
2024年12月24日 ─────────────────────────────────────────────────
            │
            ▼ 阶段 1.5 UI 增强完成 ✅
            │  - 粒子背景动效
            │  - 顶栏搜索/通知组件
            │  - 侧栏今日阅读统计
            │  - 文献库双视图 + 可折叠上传
            │  - PDF 阅读器深色模式 + 完全折叠
            │  - Bug 修复（moveCollection、Ant Design 警告）
            │
2025年1月  ────────────────────────────────────────────────────
            │
            ├── 智能分组开发（2周）
            ├── 文献计量分析（2周）
            │
2025年2月  ────────────────────────────────────────────────────
            │
            ├── RSS 订阅功能（2周）
            ├── 引用导出功能（1周）
            ├── 阶段三收尾测试（1周）
            │
            ▼ 阶段三完成（预计）
            │
2025年Q2   ────────────────────────────────────────────────────
            │
            ├── 团队协作功能
            ├── 云端同步
            │
2025年Q3   ────────────────────────────────────────────────────
            │
            ├── 浏览器插件
            ├── 桌面客户端
```

---

## 📚 参考资源

### 竞品分析

| 产品 | 可借鉴特性 |
|------|-----------|
| Zotero | 目录结构、标签系统、引用导出 |
| Mendeley | 社交功能、推荐算法 |
| Notion | 数据库视图、拖拽交互 |
| Readwise | 高亮回顾、间隔重复 |
| Papers | 原生体验、快捷键设计 |

### 技术文档

- [pdfjs-dist 官方文档](https://mozilla.github.io/pdf.js/)
- [react-pdf-highlighter GitHub](https://github.com/agentcooper/react-pdf-highlighter)
- [Framer Motion 文档](https://www.framer.com/motion/)
- [Ant Design 5 定制主题](https://ant.design/docs/react/customize-theme-cn)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)

---

## 💡 提案征集

欢迎提交新功能建议！请在 Issue 中使用以下模板：

```markdown
## 功能提案：[功能名称]

### 问题描述
描述当前痛点...

### 建议方案
描述期望的解决方案...

### 预期收益
- 收益1
- 收益2

### 参考案例
（可选）其他产品的类似实现...
```

---

<div align="center">

**🚀 让我们一起打造最好的文献管理工具！**

</div>

