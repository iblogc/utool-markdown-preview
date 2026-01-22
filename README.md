# uTools Markdown Preview

一款为 uTools 打造的高效 Markdown 预览插件，支持极速渲染、多窗口管理、Mermaid 绘图以及一键导出功能。

[![GitHub repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/iblogc/utool-markdown-preview)

---

## ✨ 功能特性

- 🚀 **极速渲染**：采用 CSS 物理隔离与任务异步切片技术，万行大文件预览依然丝滑。
- 📱 **灵动工具栏**：方案 A 级底部悬浮中心设计，磨砂玻璃质感。采用**分类配色方案**（目录/Markdown/图片/HTML），操作直观且不干扰阅读。
- 📑 **智能目录 (TOC)**：自动提取标题生成平滑跳转目录，支持一键切换。
- 🛠️ **多窗口管理**：支持预览窗口复用、实时内容更新或同时开启多个预览窗口。
- 📊 **图表支持**：内置 **Mermaid** 引擎，支持流程图、时序图、甘特图等。
- 💻 **代码高亮**：标准的 GitHub 代码风格，适配多种编程语言。
- 🎨 **主题自适应**：深度适配 uTools 的深色/浅色模式，视觉感受高度统一。
- 💾 **多维导出与共享**：
  - **Markdown**：支持导出为 .md 源码到本地。
  - **预览图**：支持将 Markdown 一键渲染为高清图片并**保存**或**直接复制到剪贴板**，方便在社交软件中分享。
  - **HTML**：支持导出包含完整独立样式的 .html（保留图表与布局）。

## 🛠️ 使用方法

1. **复制内容**：在任何地方复制你想预览的 Markdown 源码。
2. **呼出插件**：在 uTools 搜索框输入 `md预览` 或 `markdown预览`。
3. **预览管理**：
   - 第一次进入自动开启预览。
   - 窗口已打开时，主界面提供 **“显示原预览”**、**“从剪贴板更新”** 和 **“打开新窗口”** 三个功能选项。
4. **查看与导出**：
   - 悬浮在底部的 **“灵动条”** 可进行目录切换和导出操作。

## ⚙️ 性能优化说明

针对大文件阅读进行了深度重构：
- **静态化布局**：固定 UI 结构，仅动态更新正文 DOM，减少重刷。
- **渲染隔离**：利用 `contain: content` 限制重排范围。
- **GPU 加速**：目录切换动画完全由 GPU 渲染，无卡顿。

## 📦 项目结构

```text
.
├── dist/
│   ├── plugin.json         # uTools 插件配置文件
│   ├── index.html          # 主界面入口 (提示/管理面板)
│   ├── index.js            # 核心业务逻辑 (React 实现)
│   ├── preload.js          # 主进程预加载脚本
│   ├── preview.html        # 核心预览 UI (性能优化版)
│   ├── preview_preload.js  # 预览窗口预加载驱动
│   └── logo.png            # 插件图标
```


## Mermaid 图表示例合集

### 流图（Flow）

```mermaid
flowchart TD
    Start[开始]
    Input[输入数据]
    Process[处理逻辑]
    Decision{是否通过?}
    Success[成功]
    Fail[失败]
    End[结束]

    Start --> Input
    Input --> Process
    Process --> Decision
    Decision -- 是 --> Success
    Decision -- 否 --> Fail
    Success --> End
    Fail --> End
```

### 序列图（Sequence）

```mermaid
sequenceDiagram
    participant User as 用户
    participant App as 应用
    participant Server as 服务器

    User->>App: 发起请求
    App->>Server: API 调用
    Server-->>App: 返回结果
    App-->>User: 展示结果
```

### 甘特图（Gantt）

```mermaid
gantt
    title 项目计划示例
    dateFormat YYYY-MM-DD

    section 需求阶段
    需求分析 :a1, 2026-01-01, 5d
    需求评审 :a2, after a1, 2d

    section 开发阶段
    功能开发 :b1, 2026-01-08, 10d
    联调测试 :b2, after b1, 5d

    section 发布阶段
    上线发布 :c1, after b2, 1d
```

### 类图（Class）

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }

    class Order {
        +int id
        +Date createTime
        +getTotal()
    }

    User "1" --> "0..*" Order : 创建
```

### 状态迁移图（State）

```mermaid
stateDiagram-v2
    [*] --> 待支付
    待支付 --> 已支付 : 支付成功
    已支付 --> 已发货 : 发货
    已发货 --> 已完成 : 确认收货
    待支付 --> 已取消 : 取消订单
    已完成 --> [*]
    已取消 --> [*]
```

### 饼分图（Pie）

```mermaid
pie
    title 时间分配占比
    "开发" : 50
    "测试" : 20
    "文档" : 15
    "会议" : 10
    "其他" : 5
```


## 📜 开源协议

本项目采用 [MIT License](LICENSE) 协议开源。
