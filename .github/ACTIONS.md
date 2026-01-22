# GitHub Actions CI/CD 工作流

本项目配置了自动化的 CI/CD 工作流程。

## 工作流概述

### 1. CI 工作流 (`.github/workflows/ci.yml`)

**触发条件**:
- Push 到 `main` 或 `develop` 分支
- 对 `main` 或 `develop` 分支的 Pull Request

**执行内容**:
- ✅ 在 Ubuntu、Windows、macOS 三个平台上运行
- ✅ 安装依赖
- ✅ 运行代码检查 (lint)
- ✅ 构建应用程序
- ✅ 测试打包流程（不发布）

### 2. Release 工作流 (`.github/workflows/release.yml`)

**触发条件**:
- 推送标签 `v*.*.*` (例如: `v1.0.0`)

**执行内容**:
- ✅ 在三个平台上构建完整安装包
- ✅ 上传构建产物为 Artifacts
- ✅ 自动创建 GitHub Release
- ✅ 附加所有平台的安装包

## 使用说明

### 发布新版本

1. **更新版本号**
   ```bash
   # 在 package.json 中更新 version 字段
   npm version patch  # 或 minor, major
   ```

2. **提交更改**
   ```bash
   git add .
   git commit -m "chore: bump version to v1.0.1"
   ```

3. **创建并推送标签**
   ```bash
   git tag v1.0.1
   git push origin main --tags
   ```

4. **自动发布**
   - GitHub Actions 将自动触发
   - 构建所有平台的安装包
   - 创建 Release 并上传文件

## 构建产物

### Windows
- `ShellScriptManager-{version}-Setup.exe` - NSIS 安装程序
- `ShellScriptManager {version}.exe` - 便携版

### macOS
- `ShellScriptManager-{version}.dmg` - DMG 镜像

### Linux
- `ShellScriptManager-{version}.AppImage` - AppImage 格式
- `ShellScriptManager-{version}.deb` - Debian 包

## 配置说明

### 必需的 GitHub 设置

在使用前，请确保：

1. **更新 `electron-builder.yml`**
   ```yaml
   publish:
     provider: github
     owner: <YOUR_GITHUB_USERNAME>  # 替换为你的 GitHub 用户名
     repo: ShellScriptManager
   ```

2. **GitHub Token**
   - GitHub Actions 会自动使用 `GITHUB_TOKEN`
   - 无需额外配置 Secrets

3. **仓库权限**
   - 确保 GitHub Actions 有写入权限
   - Settings → Actions → General → Workflow permissions → Read and write permissions

## 故障排查

### macOS 签名问题
如果遇到 macOS 签名错误，在 `electron-builder.yml` 中已设置：
```yaml
mac:
  notarize: false
```

### Windows 代码签名
Windows 构建已禁用代码签名：
```yaml
win:
  forceCodeSigning: false
  signAndEditExecutable: false
```

### 构建失败
- 查看 Actions 标签页的详细日志
- 确保所有平台的 icon 文件存在且格式正确
- 检查 `package.json` 中的版本号格式

## 本地测试

在推送前，可以本地测试打包：

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# 所有平台 (需要对应系统)
npm run build:all
```
