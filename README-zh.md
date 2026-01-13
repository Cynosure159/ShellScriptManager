# Shell Script Manager

<div align="center">

![Electron](https://img.shields.io/badge/Electron-39.0-2F3241?style=flat-square&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

**一个现代化、跨平台的 Shell 脚本管理工具**

[English](./README.md) | 简体中文

</div>

---

## 📖 简介

**Shell Script Manager** 是一个基于 Electron 构建的桌面应用程序，旨在简化 Shell 和 Batch 脚本的编写、管理和执行流程。无论你是需要管理日常运维脚本的开发者，还是由于环境限制无法方便使用命令行的 Windows 用户，它都能提供极佳的体验。

集成 CodeMirror 6 编辑器与 xterm.js 终端，支持 Windows (Batch/PowerShell) 和 Linux/macOS (Bash) 环境。

## ✨ 核心特性

- **💻 跨平台脚本支持**
  - **Windows**: 原生完美支持 Batch (`.bat`) 和 PowerShell (`.ps1`)，自动处理中文编码 (GBK/UTF-8) 问题。
  - **Linux/macOS**: 完美支持 Bash (`.sh`) 脚本。
  - **智能检测**: 根据操作系统自动推荐脚本类型和默认模板。

- **📝 现代化编辑器**
  - 集成 **CodeMirror 6**，提供专业的语法高亮。
  - 沉浸式 **暗色主题**，减少眼部疲劳。

- **🖥️ 实时交互终端**
  - 内置 **xterm.js** 终端模拟器，体验接近原生终端。
  - 实时流式显示标准输出 (stdout) 和标准错误 (stderr)。
  - 支持 ANSI 颜色代码显示。
  - **可拖拽**调整终端面板高度，灵活布局。

- **🗂️ 便捷管理**
  - **分类管理**: 自定义脚本分类，井井有条。
  - **数据安全**: 支持 JSON 格式的数据导入与导出备份。
  - **本地存储**: 轻量级持久化存储，无需配置数据库。
  - **拖拽排序**: 支持脚本列表和分类列表的拖拽排序。

## 🗺️ 路线图 (Roadmap)

- [x] **编辑器优化**: 增加自动换行开关
- [ ] **日志系统**: 完善日志记录并支持导出
- [ ] **终端增强**: 支持将终端输出保存为文件
- [ ] **导入增强**: 支持导入单个脚本文件 (.sh/.bat/.ps1)
- [ ] **UI 自由度**: 列表侧边栏宽度可拖拽调整
- [ ] **CI/CD**: 配置 GitHub Actions 自动化构建
- [ ] **国际化**: 支持多语言界面切换

## 📸 截图

*(此处预留应用截图位置，建议添加运行截图)*

<!--
![App Screenshot](./resources/screenshot.png)
-->

## 🛠️ 技术栈

本项目采用最新的前端与桌面开发技术栈构建：

- **Core**: Electron 39
- **Build**: Vite 7 (electron-vite)
- **Frontend**: React 19 + TypeScript 5
- **UI Framework**: Mantine v8
- **State Management**: Zustand 5
- **Editor & Terminal**: CodeMirror 6, xterm.js 5

## 🚀 快速开始

### 环境要求

- Node.js >= 20
- npm 或 pnpm

### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/shell-script-manager.git

# 2. 进入目录
cd shell-script-manager

# 3. 安装依赖
npm install

# 4. 启动开发环境
npm run dev
```

### 构建打包

```bash
# 构建 Windows 安装包/可执行文件
npm run build:win

# 构建 macOS 版本
npm run build:mac

# 构建 Linux 版本
npm run build:linux
```

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进这个项目！

## 📄 开源协议

MIT License &copy; 2026
