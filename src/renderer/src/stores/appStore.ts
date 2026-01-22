import { create } from 'zustand'
import type { Category, Script } from '../types'

// 声明全局 API 类型
declare global {
  interface Window {
    api: {
      platform: string
      getCategories: () => Promise<Category[]>
      addCategory: (name: string) => Promise<Category>
      updateCategory: (id: string, updates: Partial<Category> | string) => Promise<Category | null>
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
      importScriptFile: (categoryId: string) => Promise<Script | null>
      saveTerminalOutput: (content: string, suggestedName?: string) => Promise<{ success: boolean; path?: string; error?: string }>
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
  wordWrap: boolean
  
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
  importScript: () => Promise<void>
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
  toggleWordWrap: () => Promise<void>
  reorderScripts: (categoryId: string, sourceIndex: number, destinationIndex: number) => Promise<void>
  reorderCategories: (sourceIndex: number, destinationIndex: number) => Promise<void>
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
  wordWrap: false,

  // 加载数据
  loadData: async () => {
    const [categories, scripts] = await Promise.all([
      window.api.getCategories(),
      window.api.getScripts()
    ])
    
    // 分类排序：Default 永远置顶，其他按 order 升序
    categories.sort((a, b) => {
        if (a.id === 'default') return -1
        if (b.id === 'default') return 1
        return (a.order ?? 0) - (b.order ?? 0)
    })
    
    // 排序：优先按 order 升序，其次按 createdAt 降序
    scripts.sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER
        if (orderA !== orderB) {
            return orderA - orderB
        }
        return b.createdAt - a.createdAt
    })

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
    const wordWrap = await window.api.getConfig('wordWrap') || false
    set({ defaultWorkDir, wordWrap })
  },

  updateDefaultWorkDir: async (path) => {
    await window.api.setConfig('defaultWorkDir', path)
    set({ defaultWorkDir: path })
  },

  toggleWordWrap: async () => {
    const newValue = !get().wordWrap
    await window.api.setConfig('wordWrap', newValue)
    set({ wordWrap: newValue })
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
    await window.api.updateCategory(id, { name })
    await get().loadData()
  },

  // 删除分类
  deleteCategory: async (id) => {
    await window.api.deleteCategory(id)
    await get().loadData()
  },
  
  reorderCategories: async (sourceIndex, destinationIndex) => {
    // 1. 获取所有非 default 的分类
    const allCategories = get().categories
    const customCategories = allCategories.filter(c => c.id !== 'default')
    
    // 2. 内存中重排
    // 注意：sourceIndex 和 destinationIndex 是基于 customCategories 的索引
    const newOrderCategories = Array.from(customCategories)
    const [moved] = newOrderCategories.splice(sourceIndex, 1)
    newOrderCategories.splice(destinationIndex, 0, moved)
    
    // 3. 更新受影响的 items order
    // 偏移量：因为 default 占了 order 0 (或者我们假设 custom 从 1 开始)
    // 为了简单，我们让 custom categories 的 order 从 1 开始递增。
    const updatePromises = newOrderCategories.map((category, index) => {
        const newOrder = index + 1
        if (category.order !== newOrder) {
            return window.api.updateCategory(category.id, { order: newOrder })
        }
        return Promise.resolve()
    })
    
    await Promise.all(updatePromises)
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
    
    // 设置顺序 (放在最后)
    const categoryScripts = get().scripts.filter(s => s.categoryId === categoryId)
    // 获取当前最大 order
    const maxOrder = categoryScripts.length > 0 
        ? Math.max(...categoryScripts.map(s => s.order ?? 0)) 
        : -1
    
    const newOrder = maxOrder + 1
    const updates: Partial<Script> = { order: newOrder }

    if (defaultWorkDir) {
       updates.workDir = defaultWorkDir
    }
    
    await window.api.updateScript(script.id, updates)
    script.order = newOrder
    if (defaultWorkDir) script.workDir = defaultWorkDir

    set((state) => ({
      scripts: [...state.scripts, script],
      editingScript: script,
      selectedScriptId: script.id,
      isScriptModified: false
    }))
  },

  importScript: async () => {
    const categoryId = get().selectedCategoryId || 'default'
    
    const script = await window.api.importScriptFile(categoryId)
    if (!script) return

    // 获取全局默认运行目录
    const defaultWorkDir = get().defaultWorkDir
    
    // 设置顺序 (放在最后)
    const categoryScripts = get().scripts.filter(s => s.categoryId === categoryId)
    const maxOrder = categoryScripts.length > 0 
        ? Math.max(...categoryScripts.map(s => s.order ?? 0)) 
        : -1
    
    const newOrder = maxOrder + 1
    const updates: Partial<Script> = { order: newOrder }

    if (defaultWorkDir) {
       updates.workDir = defaultWorkDir
    }
    
    await window.api.updateScript(script.id, updates)
    script.order = newOrder
    if (defaultWorkDir) script.workDir = defaultWorkDir

    set((state) => ({
      scripts: [...state.scripts, script],
      editingScript: script,
      selectedScriptId: script.id,
      isScriptModified: false
    }))
  },

  reorderScripts: async (categoryId, sourceIndex, destinationIndex) => {
    // 1. 获取当前分类下的脚本
    const allScripts = get().scripts
    const categoryScripts = allScripts
        .filter(s => s.categoryId === categoryId)
        .sort((a, b) => {
            const oa = a.order ?? Number.MAX_SAFE_INTEGER
            const ob = b.order ?? Number.MAX_SAFE_INTEGER
            if (oa !== ob) return oa - ob
            return b.createdAt - a.createdAt
        })
    
    // 2. 内存中重排
    const newOrderScripts = Array.from(categoryScripts)
    const [moved] = newOrderScripts.splice(sourceIndex, 1)
    newOrderScripts.splice(destinationIndex, 0, moved)
    
    // 3. 更新受影响的 items order
    // 简单起见，更新所有项目的 order
    const updatePromises = newOrderScripts.map((script, index) => {
        if (script.order !== index) {
            return window.api.updateScript(script.id, { order: index })
        }
        return Promise.resolve()
    })
    
    await Promise.all(updatePromises)
    await get().loadData()
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
