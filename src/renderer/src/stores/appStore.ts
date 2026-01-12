import { create } from 'zustand'
import type { Category, Script } from '../types'

// 声明全局 API 类型
declare global {
  interface Window {
    api: {
      platform: string
      getCategories: () => Promise<Category[]>
      addCategory: (name: string) => Promise<Category>
      updateCategory: (id: string, name: string) => Promise<Category | null>
      deleteCategory: (id: string) => Promise<boolean>
      getScripts: () => Promise<Script[]>
      getScript: (id: string) => Promise<Script | undefined>
      addScript: (categoryId: string, name: string, description: string, content: string, scriptType: string) => Promise<Script>
      updateScript: (id: string, updates: Partial<Script>) => Promise<Script | null>
      deleteScript: (id: string) => Promise<boolean>
      runScript: (scriptId: string, content: string, scriptType: string, workDir?: string) => Promise<{ success: boolean; exitCode: number | null; signal: string | null }>
      stopScript: (scriptId: string) => Promise<boolean>
      onScriptOutput: (callback: (scriptId: string, output: string) => void) => () => void
      exportData: () => Promise<{ success: boolean; path?: string; error?: string }>
      importData: () => Promise<{ success: boolean; error?: string }>
      // Config & System
      getConfig: (key: string) => Promise<any>
      setConfig: (key: string, value: any) => Promise<void>
      selectDirectory: () => Promise<string | null>
    }
  }
}

interface AppState {
  // 数据
  categories: Category[]
  scripts: Script[]
  
  // 选中状态
  selectedCategoryId: string | null
  selectedScriptId: string | null
  
  // 编辑状态
  editingScript: Script | null
  isScriptModified: boolean
  
  // 运行状态
  runningScriptId: string | null
  terminalOutput: string

  // 配置状态
  defaultWorkDir: string
  
  // 操作
  loadData: () => Promise<void>
  selectCategory: (categoryId: string | null) => void
  selectScript: (scriptId: string | null) => void
  
  // 分类操作
  addCategory: (name: string) => Promise<void>
  updateCategory: (id: string, name: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  
  // 脚本操作
  addScript: () => Promise<void>
  updateEditingScript: (updates: Partial<Script>) => void
  saveScript: () => Promise<void>
  deleteScript: (id: string) => Promise<void>
  
  // 运行脚本
  runScript: () => Promise<void>
  stopScript: () => Promise<void>
  appendTerminalOutput: (output: string) => void
  clearTerminalOutput: () => void
  
  // 导入导出
  exportData: () => Promise<{ success: boolean }>
  importData: () => Promise<{ success: boolean }>

  // 配置操作
  fetchConfig: () => Promise<void>
  updateDefaultWorkDir: (path: string) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  categories: [],
  scripts: [],
  selectedCategoryId: null,
  selectedScriptId: null,
  editingScript: null,
  isScriptModified: false,
  runningScriptId: null,
  terminalOutput: '',
  defaultWorkDir: '',

  // 加载数据
  loadData: async () => {
    const [categories, scripts] = await Promise.all([
      window.api.getCategories(),
      window.api.getScripts()
    ])
    set({ categories, scripts })
    
    // 默认选中第一个分类
    if (categories.length > 0 && !get().selectedCategoryId) {
      set({ selectedCategoryId: categories[0].id })
    }
    
    // 加载配置
    await get().fetchConfig()
  },

  fetchConfig: async () => {
    const defaultWorkDir = await window.api.getConfig('defaultWorkDir') || ''
    set({ defaultWorkDir })
  },

  updateDefaultWorkDir: async (path) => {
    await window.api.setConfig('defaultWorkDir', path)
    set({ defaultWorkDir: path })
  },

  // 选择分类
  selectCategory: (categoryId) => {
    set({ selectedCategoryId: categoryId, selectedScriptId: null, editingScript: null })
  },

  // 选择脚本
  selectScript: async (scriptId) => {
    if (scriptId) {
      const script = await window.api.getScript(scriptId)
      if (script) {
        set({ 
          selectedScriptId: scriptId, 
          editingScript: { ...script },
          isScriptModified: false
        })
      }
    } else {
      set({ selectedScriptId: null, editingScript: null, isScriptModified: false })
    }
  },

  // 添加分类
  addCategory: async (name) => {
    await window.api.addCategory(name)
    await get().loadData()
  },

  // 更新分类
  updateCategory: async (id, name) => {
    await window.api.updateCategory(id, name)
    await get().loadData()
  },

  // 删除分类
  deleteCategory: async (id) => {
    await window.api.deleteCategory(id)
    await get().loadData()
  },

  // 添加脚本
  addScript: async () => {
    const categoryId = get().selectedCategoryId || 'default'
    
    // 获取全局默认运行目录
    const defaultWorkDir = get().defaultWorkDir
    
    // 根据平台设置默认脚本类型和内容
    const isWindows = window.api.platform === 'win32'
    const scriptType = isWindows ? 'batch' : 'bash'
    const defaultContent = isWindows 
      ? '@echo off\r\nchcp 65001 >nul\r\necho Hello World' 
      : '#!/bin/bash\n\necho "Hello World"'
    
    // 增加 workDir 字段
    const script = await window.api.addScript(categoryId, '新建脚本', '', defaultContent, scriptType)
    
    if (defaultWorkDir) {
       // 如果有默认目录，立即更新脚本属性
       // 注意：这里我们调用 updateScript 因为 addScript API 目前不支持 workDir 参数
       // 或者我们可以修改 addScript IPC，但为了少改动 IPC, update 是安全的
       await window.api.updateScript(script.id, { workDir: defaultWorkDir })
       script.workDir = defaultWorkDir
    }

    set((state) => ({
      scripts: [...state.scripts, script],
      editingScript: script
    }))
  },

  // 更新编辑中的脚本
  updateEditingScript: (updates) => {
    const current = get().editingScript
    if (current) {
      set({ 
        editingScript: { ...current, ...updates },
        isScriptModified: true
      })
    }
  },

  // 保存脚本
  saveScript: async () => {
    const script = get().editingScript
    if (script && get().isScriptModified) {
      await window.api.updateScript(script.id, {
        name: script.name,
        description: script.description,
        content: script.content,
        scriptType: script.scriptType,
        categoryId: script.categoryId,
        workDir: script.workDir
      })
      await get().loadData()
      set({ isScriptModified: false })
    }
  },

  // 删除脚本
  deleteScript: async (id) => {
    await window.api.deleteScript(id)
    if (get().selectedScriptId === id) {
      set({ selectedScriptId: null, editingScript: null })
    }
    await get().loadData()
  },

  // 运行脚本
  runScript: async () => {
    const script = get().editingScript
    if (!script) return
    
    // 运行前清空上次输出
    set({ runningScriptId: script.id, terminalOutput: '' })
    
    try {
      // 传入 workDir
      const result = await window.api.runScript(script.id, script.content, script.scriptType || 'batch', script.workDir)
      const exitMsg = result.success 
        ? '\n\x1b[32m[进程已完成，退出码: 0]\x1b[0m\n'
        : `\n\x1b[31m[进程已完成，退出码: ${result.exitCode}]\x1b[0m\n`
      get().appendTerminalOutput(exitMsg)
    } catch (error) {
      get().appendTerminalOutput(`\n\x1b[31m[执行错误: ${error}]\x1b[0m\n`)
    } finally {
      set({ runningScriptId: null })
    }
  },

  // 停止脚本
  stopScript: async () => {
    const scriptId = get().runningScriptId
    if (scriptId) {
      await window.api.stopScript(scriptId)
      get().appendTerminalOutput('\n\x1b[33m[进程已终止]\x1b[0m\n')
      set({ runningScriptId: null })
    }
  },

  // 追加终端输出
  appendTerminalOutput: (output) => {
    set(state => ({ terminalOutput: state.terminalOutput + output }))
  },

  // 清空终端输出
  clearTerminalOutput: () => {
    set({ terminalOutput: '' })
  },

  // 导出数据
  exportData: async () => {
    return await window.api.exportData()
  },

  // 导入数据
  importData: async () => {
    const result = await window.api.importData()
    if (result.success) {
      await get().loadData()
    }
    return result
  }
}))
