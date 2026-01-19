# uTools Markdown Preview

一款为 uTools 打造的高效 Markdown 预览插件，支持实时预览、Mermaid 绘图以及一键导出功能。

[![GitHub repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/iblogc/utool-markdown-preview)

---

## ✨ 功能特性

- 🚀 **即时预览**：一键呼出，快速渲染剪贴板中的 Markdown 内容。
- 📊 **图表支持**：内置 **Mermaid** 引擎，支持流程图、时序图、甘特图、饼图等。
- 💻 **代码高亮**：采用经典的 Github 风格排版，代码片段清晰易读。
- 🎨 **主题自适应**：动态适配 uTools 的深色/浅色模式，保护视力。
- 💾 **一键导出**：
  - 支持导出为 **.md** 纯文本。
  - 支持导出为包含样式的完整 **.html** 文档。
- 📂 **智能交互**：下载文件后自动在文件管理器中定位，无需寻找。

## 🛠️ 使用方法

1. **复制内容**：在任何地方复制你想预览的 Markdown 源码。
2. **呼出插件**：在 uTools 搜索框输入 `md预览` 或 `markdown预览`。
3. **查看与导出**：
   - 页面将自动显示渲染后的内容。
   - 点击右上角的“下载 HTML”或“下载 MD”进行导出。

## 📦 项目结构

```text
.
├── plugin.json         # uTools 插件配置文件
├── index.html          # 主入口文件
├── index.js            # 插件逻辑核心
├── preload.js          # 主进程预加载脚本
├── preview.html        # 预览窗口 UI
├── preview_preload.js  # 预览窗口预加载脚本 (处理原生 IO 与通知)
└── logo.png            # 插件图标
```

## ⚙️ 开发与调试

如果您想自行修改或增强功能：

1. 克隆本项目到本地。
2. 在 uTools 开发者中心选择“新建项目”，指向 `plugin.json` 即可。
3. 修改代码后，在 uTools 中重载插件查看效果。

## 📜 开源协议

本项目采用 [MIT License](LICENSE) 协议开源。
