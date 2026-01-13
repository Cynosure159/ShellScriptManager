# Shell Script Manager

<div align="center">

![Electron](https://img.shields.io/badge/Electron-39.0-2F3241?style=flat-square&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

**A modern, cross-platform Shell Script Management Tool**

English | [简体中文](./README-zh.md)

</div>

---

## 📖 Introduction

**Shell Script Manager** is a desktop application built with Electron, designed to simplify the workflow of writing, managing, and executing Shell and Batch scripts. Whether you are a developer managing operation scripts or a Windows user dealing with command-line limitations, this tool provides an excellent experience.

It integrates the CodeMirror 6 editor and xterm.js terminal, supporting Windows (Batch/PowerShell) and Linux/macOS (Bash) environments effortlessly.

## ✨ Features

- **💻 Cross-Platform Support**
  - **Windows**: Native support for Batch (`.bat`) and PowerShell (`.ps1`), with automatic handling of encoding issues (GBK/UTF-8).
  - **Linux/macOS**: Native support for Bash (`.sh`) scripts.
  - **Smart Selection**: Automatically detects the OS and recommends the appropriate script type/template.

- **📝 Modern Editor**
  - Integrated **CodeMirror 6** for professional syntax highlighting.
  - Immersive **Dark Theme** for a comfortable coding experience.

- **🖥️ Real-time Interactive Terminal**
  - Built-in **xterm.js** terminal emulator.
  - Real-time streaming of stdout and stderr.
  - Full ANSI color code support.
  - **Resizable** terminal pane for flexible layout.

- **🗂️ Easy Management**
  - **Categorization**: Organize scripts into custom categories.
  - **Data Safety**: Import/Export data via JSON for backup.
  - **Local Persistence**: Lightweight local storage using `electron-store`.
  - **Drag & Drop**: Reorder scripts and categories via drag and drop.

## 🗺️ Roadmap

- [x] **Editor**: Add Word Wrap toggle
- [ ] **Logs**: Improved log system & export
- [ ] **Terminal**: Export terminal output to file
- [ ] **Import**: Support importing single script files (.sh/.bat/.ps1)
- [x] **UI**: Resizable sidebar width
- [ ] **CI/CD**: GitHub Actions integration
- [ ] **i18n**: Multi-language support

## 📸 Screenshots

*(Placeholder for application screenshots)*

<!--
![App Screenshot](./resources/screenshot.png)
-->

## 🛠️ Tech Stack

Built with the latest modern web and desktop technologies:

- **Core**: Electron 39
- **Build**: Vite 7 (electron-vite)
- **Frontend**: React 19 + TypeScript 5
- **UI Framework**: Mantine v8
- **State Management**: Zustand 5
- **Editor & Terminal**: CodeMirror 6, xterm.js 5

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- npm or pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/shell-script-manager.git

# 2. Navigate to directory
cd shell-script-manager

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

### Build

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

MIT License &copy; 2026
