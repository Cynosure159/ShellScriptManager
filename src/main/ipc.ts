import { ipcMain, dialog } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getScripts,
  getScript,
  addScript,
  updateScript,
  deleteScript,
  exportData,
  importData
} from './store'

// 存储运行中的脚本进程
const runningProcesses = new Map<string, ChildProcess>()

/**
 * 注册所有 IPC 处理器
 */
export function registerIpcHandlers(): void {
  // ==================== 分类相关 ====================
  
  ipcMain.handle('get-categories', () => {
    return getCategories()
  })

  ipcMain.handle('add-category', (_, name: string) => {
    return addCategory(name)
  })

  ipcMain.handle('update-category', (_, id: string, name: string) => {
    return updateCategory(id, name)
  })

  ipcMain.handle('delete-category', (_, id: string) => {
    return deleteCategory(id)
  })

  // ==================== 脚本相关 ====================

  ipcMain.handle('get-scripts', () => {
    return getScripts()
  })

  ipcMain.handle('get-script', (_, id: string) => {
    return getScript(id)
  })

  ipcMain.handle('add-script', (_, categoryId: string, name: string, description: string, content: string, scriptType: any) => {
    return addScript(categoryId, name, description, content, scriptType)
  })

  ipcMain.handle('update-script', (_, id: string, updates: object) => {
    return updateScript(id, updates)
  })

  ipcMain.handle('delete-script', (_, id: string) => {
    return deleteScript(id)
  })

  // ==================== 脚本执行 ====================

  ipcMain.handle('run-script', (event, scriptId: string, content: string, scriptType: string) => {
    return new Promise((resolve) => {
      const tmpDir = os.tmpdir()
      const isWindows = process.platform === 'win32'
      
      // 根据脚本类型确定文件扩展名
      let ext: string
      let shell: string
      let args: string[]
      let scriptContent = content

      if (scriptType === 'batch') {
        // Windows batch 脚本
        ext = '.bat'
        shell = 'cmd.exe'
        // 添加 UTF-8 编码设置
        scriptContent = '@echo off\r\nchcp 65001 >nul\r\n' + content.replace(/\n/g, '\r\n')
      } else if (scriptType === 'powershell') {
        // PowerShell 脚本
        ext = '.ps1'
        shell = 'powershell.exe'
        args = ['-ExecutionPolicy', 'Bypass', '-File']
      } else {
        // Bash 脚本 (Linux/macOS)
        ext = '.sh'
        shell = '/bin/bash'
      }

      const scriptPath = path.join(tmpDir, `script_${scriptId}_${Date.now()}${ext}`)
      
      // 写入脚本内容
      fs.writeFileSync(scriptPath, scriptContent, { encoding: 'utf-8', mode: 0o755 })

      // 设置命令参数
      if (scriptType === 'batch') {
        args = ['/c', scriptPath]
      } else if (scriptType === 'powershell') {
        args = ['-ExecutionPolicy', 'Bypass', '-File', scriptPath]
      } else {
        args = [scriptPath]
      }

      // 启动脚本进程
      const child = spawn(shell, args, {
        cwd: os.homedir(),
        env: {
          ...process.env,
          LANG: 'en_US.UTF-8',
          LC_ALL: 'en_US.UTF-8'
        },
        windowsHide: true
      })

      runningProcesses.set(scriptId, child)

      // 发送 stdout 输出
      child.stdout.on('data', (data: Buffer) => {
        event.sender.send('script-output', scriptId, data.toString('utf-8'))
      })

      // 发送 stderr 输出
      child.stderr.on('data', (data: Buffer) => {
        event.sender.send('script-output', scriptId, data.toString('utf-8'))
      })

      // 进程结束
      child.on('close', (code, signal) => {
        runningProcesses.delete(scriptId)
        try {
          fs.unlinkSync(scriptPath)
        } catch {
          // 忽略清理错误
        }
        resolve({ success: code === 0, exitCode: code, signal })
      })

      // 进程错误
      child.on('error', (error) => {
        runningProcesses.delete(scriptId)
        event.sender.send('script-output', scriptId, `\x1b[31mError: ${error.message}\x1b[0m\n`)
        resolve({ success: false, exitCode: null, signal: null })
      })
    })
  })

  // 终止脚本
  ipcMain.handle('stop-script', (_, scriptId: string) => {
    const proc = runningProcesses.get(scriptId)
    if (proc) {
      proc.kill('SIGTERM')
      runningProcesses.delete(scriptId)
      return true
    }
    return false
  })

  // ==================== 导入导出 ====================

  ipcMain.handle('export-data', async () => {
    const result = await dialog.showSaveDialog({
      title: '导出数据',
      defaultPath: 'shell-scripts-backup.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })

    if (result.canceled || !result.filePath) {
      return { success: false }
    }

    try {
      const data = exportData()
      fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8')
      return { success: true, path: result.filePath }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('import-data', async () => {
    const result = await dialog.showOpenDialog({
      title: '导入数据',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false }
    }

    try {
      const content = fs.readFileSync(result.filePaths[0], 'utf-8')
      const data = JSON.parse(content)
      const success = importData(data)
      return { success }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })
}
