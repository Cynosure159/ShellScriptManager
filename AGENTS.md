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
4. **脚本执行** - 运行 Bash 脚本并实时显示输出
6. **脚本类型** - 支持 Batch (Windows CMD) 和 Bash (Linux/macOS)
7. **界面增强** - 终端高度可拖拽调整，运行前自动清空输出
