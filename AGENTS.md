# Shell Script Manager

## 项目概述
基于 Electron 的 Shell 脚本管理器，用于管理、编辑和运行 Bash 脚本。

## 技术栈
- **框架**: Electron 39 + Vite 7 (electron-vite)
- **前端**: React 19 + TypeScript 5
- **UI 组件**: Mantine 8
- **代码编辑器**: CodeMirror 6
- **终端模拟**: xterm.js 5 (@xterm/xterm)
- **状态管理**: Zustand 5
- **数据存储**: electron-store 8

## 设计规范
- **主题**: 暗色主题
- **主题色**: 低饱和度紫色 `#8B7EC8`
- **Shell 类型**: Bash

## 项目结构
```
ShellScriptManager/
├── src/
│   ├── main/                 # Electron 主进程
│   │   ├── index.ts          # 主进程入口
│   │   ├── ipc.ts            # IPC 通信处理
│   │   └── store.ts          # 数据存储
│   ├── preload/              # 预加载脚本
│   │   └── index.ts
│   └── renderer/             # 渲染进程 (React)
│       └── src/
│           ├── App.tsx
│           ├── main.tsx
│           ├── components/
│           │   ├── Sidebar/      # 分类侧边栏
│           │   ├── ScriptList/   # 脚本列表
│           │   ├── ScriptEditor/ # 脚本编辑器
│           │   └── Terminal/     # 终端输出
│           ├── stores/
│           │   └── appStore.ts   # Zustand 状态管理
│           ├── styles/
│           │   └── index.css     # 全局样式
│           └── types/
│               └── index.ts      # 类型定义
├── electron.vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.web.json
└── package.json
```

## 数据结构
```typescript
interface Category {
  id: string
  name: string
  order: number
}

interface Script {
  id: string
  categoryId: string
  name: string
  description: string
  content: string
  scriptType?: 'bash' | 'batch' | 'powershell'
  workDir?: string
  createdAt: number
  updatedAt: number
}
```

## 开发命令
```bash
npm install         # 安装依赖
npm run dev         # 开发模式
npm run build       # 构建生产版本
npm run build:win   # 构建 Windows 安装包
```

## 核心功能
1. **分类管理** - 创建、编辑、删除脚本分类
2. **脚本管理** - 创建、编辑、删除脚本
3. **脚本编辑** - CodeMirror 语法高亮编辑器
4. **脚本执行** - 运行脚本并实时显示输出，支持配置运行根目录
5. **导入导出** - JSON 格式导入导出数据
6. **脚本类型** - 支持 Batch (Windows CMD), PowerShell 和 Bash
7. **界面增强** - 终端高度可拖拽，全局/单脚本运行目录配置
8. **性能优化** - 终端采用流式渲染

## 已完成优化
- **终端性能**: 优化大量输出时的性能，采用流式渲染 (Direct XTerm Write) 避免 React 重渲染卡顿。
- **自定义运行目录**: 支持全局设置默认运行目录，并可单独为每个脚本指定运行根目录。
- **UI/UX 优化**: 优化了脚本列表删除按钮的触发面积与视觉效果。
- **视觉品牌**: 采用了全新的暗色风格应用图标，解决了图标白边问题。
- **安全性增强**: 实现 App 启动与退出时自动清理系统临时目录中的残留脚本文件。
- **拖拽排序**: 实现了脚本列表和分类列表的拖拽排序功能 (`@hello-pangea/dnd`)，默认分类固定置顶。

## 优化建议 (待办)
1. **各种 Shell 支持**: 增加对 Git Bash 或 WSL 的自动探测和支持。
2. **用户体验**: 增加脚本运行快捷键 (Ctrl+R)。
3. **健壮性**: 优化 IPC 文件写入的错误处理机制。
4. **多语言支持**: 引入 i18n 支持并国际化界面文案。

