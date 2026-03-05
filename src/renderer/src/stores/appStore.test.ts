import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAppStore } from './appStore'
import { Category, Script } from '../types'

// Mock initial data
const mockCategories: Category[] = [
  { id: 'default', name: 'Default', order: 0 },
  { id: 'cat1', name: 'Category 1', order: 1 }
]

const mockScripts: Script[] = [
  { 
    id: 'script1', 
    categoryId: 'default', 
    name: 'Script 1', 
    description: 'Test description',
    content: 'echo 1', 
    scriptType: 'bash',
    createdAt: 1000, 
    updatedAt: 1000, 
    order: 0 
  }
]

describe('appStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useAppStore.getState()
    // Reset state manually if needed, or rely on create fresh if we were using a factory
    // For Zustand, we can just set values back to initial
    useAppStore.setState({
      categories: [],
      scripts: [],
      selectedCategoryId: null,
      selectedScriptId: null,
      editingScript: null,
      isScriptModified: false,
      runningScriptId: null,
      terminalOutput: '',
      defaultWorkDir: '',
      wordWrap: false
    })

    // Mock window.api
    // @ts-ignore
    window.api = {
      platform: 'darwin',
      getCategories: vi.fn().mockResolvedValue(mockCategories),
      getScripts: vi.fn().mockResolvedValue(mockScripts),
      getScript: vi.fn().mockResolvedValue(mockScripts[0]),
      addCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      addScript: vi.fn().mockResolvedValue({ id: 'new-script', name: 'new', createdAt: Date.now() }),
      updateScript: vi.fn(),
      deleteScript: vi.fn(),
      runScript: vi.fn(),
      stopScript: vi.fn(),
      onScriptOutput: vi.fn(),
      exportData: vi.fn(),
      importData: vi.fn(),
      importScriptFile: vi.fn(),
      saveTerminalOutput: vi.fn(),
      getConfig: vi.fn(),
      setConfig: vi.fn(),
      selectDirectory: vi.fn()
    }
  })

  it('应当能正确加载数据', async () => {
    await useAppStore.getState().loadData()
    const state = useAppStore.getState()
    
    expect(state.categories).toHaveLength(2)
    expect(state.scripts).toHaveLength(1)
    expect(state.selectedCategoryId).toBe('default')
  })

  it('应当能选择分类', () => {
    useAppStore.getState().selectCategory('cat1')
    expect(useAppStore.getState().selectedCategoryId).toBe('cat1')
    expect(useAppStore.getState().selectedScriptId).toBeNull()
  })

  it('应当能选择脚本并加载详情', async () => {
    await useAppStore.getState().selectScript('script1')
    const state = useAppStore.getState()
    
    expect(state.selectedScriptId).toBe('script1')
    expect(state.editingScript?.name).toBe('Script 1')
    expect(state.isScriptModified).toBe(false)
  })

  it('应当能正确添加分类', async () => {
    await useAppStore.getState().addCategory('New Category')
    expect(window.api.addCategory).toHaveBeenCalledWith('New Category')
    expect(window.api.getCategories).toHaveBeenCalledTimes(1) // loadData nested
  })

  it('应当能正确删除脚本', async () => {
    useAppStore.setState({ selectedScriptId: 'script1', editingScript: mockScripts[0] })
    
    await useAppStore.getState().deleteScript('script1')
    
    expect(window.api.deleteScript).toHaveBeenCalledWith('script1')
    expect(useAppStore.getState().selectedScriptId).toBeNull()
    expect(useAppStore.getState().editingScript).toBeNull()
  })

  it('保存脚本时若未修改则不触发 API', async () => {
    useAppStore.setState({ editingScript: mockScripts[0], isScriptModified: false })
    
    await useAppStore.getState().saveScript()
    expect(window.api.updateScript).not.toHaveBeenCalled()
  })

  it('编辑并保存脚本应当同步数据', async () => {
    useAppStore.setState({ editingScript: mockScripts[0], isScriptModified: true })
    
    await useAppStore.getState().saveScript()
    
    expect(window.api.updateScript).toHaveBeenCalledWith('script1', expect.objectContaining({
      name: 'Script 1'
    }))
    expect(useAppStore.getState().isScriptModified).toBe(false)
  })

  it('运行脚本应当更新运行状态', async () => {
    const runPromise = Promise.resolve({ success: true, exitCode: 0, signal: null })
    // @ts-ignore
    window.api.runScript.mockReturnValue(runPromise)
    
    useAppStore.setState({ editingScript: mockScripts[0] })
    
    const runCall = useAppStore.getState().runScript()
    expect(useAppStore.getState().runningScriptId).toBe('script1')
    
    await runCall
    expect(useAppStore.getState().runningScriptId).toBeNull()
  })

  it('更新编辑脚本时应当标记已修改', () => {
    // First select a script
    useAppStore.setState({ editingScript: mockScripts[0], isScriptModified: false })
    
    useAppStore.getState().updateEditingScript({ name: 'Updated Name' })
    const state = useAppStore.getState()
    
    expect(state.editingScript?.name).toBe('Updated Name')
    expect(state.isScriptModified).toBe(true)
  })

  it('清空终端输出应当生效', () => {
    useAppStore.setState({ terminalOutput: 'some output' })
    useAppStore.getState().clearTerminalOutput()
    expect(useAppStore.getState().terminalOutput).toBe('')
  })
})
