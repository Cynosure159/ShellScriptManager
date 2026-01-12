import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Category, Script, AppData, ScriptExecutionResult } from '../renderer/src/types'

/**
 * 自定义 API
 */
const api = {
  // ==================== 系统信息 ====================
  platform: process.platform,

  // ==================== 分类相关 ====================
  getCategories: (): Promise<Category[]> => ipcRenderer.invoke('get-categories'),
  addCategory: (name: string): Promise<Category> => ipcRenderer.invoke('add-category', name),
  updateCategory: (id: string, name: string): Promise<Category | null> => 
    ipcRenderer.invoke('update-category', id, name),
  deleteCategory: (id: string): Promise<boolean> => ipcRenderer.invoke('delete-category', id),

  // ==================== 脚本相关 ====================
  getScripts: (): Promise<Script[]> => ipcRenderer.invoke('get-scripts'),
  getScript: (id: string): Promise<Script | undefined> => ipcRenderer.invoke('get-script', id),
  addScript: (categoryId: string, name: string, description: string, content: string, scriptType: string): Promise<Script> =>
    ipcRenderer.invoke('add-script', categoryId, name, description, content, scriptType),
  updateScript: (id: string, updates: Partial<Script>): Promise<Script | null> =>
    ipcRenderer.invoke('update-script', id, updates),
  deleteScript: (id: string): Promise<boolean> => ipcRenderer.invoke('delete-script', id),

  // ==================== 脚本执行 ====================
  runScript: (scriptId: string, content: string, scriptType: string): Promise<ScriptExecutionResult> =>
    ipcRenderer.invoke('run-script', scriptId, content, scriptType),
  stopScript: (scriptId: string): Promise<boolean> => ipcRenderer.invoke('stop-script', scriptId),
  onScriptOutput: (callback: (scriptId: string, output: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, scriptId: string, output: string) => {
      callback(scriptId, output)
    }
    ipcRenderer.on('script-output', handler)
    return () => ipcRenderer.removeListener('script-output', handler)
  },

  // ==================== 导入导出 ====================
  exportData: (): Promise<{ success: boolean; path?: string; error?: string }> =>
    ipcRenderer.invoke('export-data'),
  importData: (): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('import-data')
}

// 暴露 API 给渲染进程
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}

// 导出类型供渲染进程使用
export type ApiType = typeof api
