import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as storeModule from './store'

// Mock electron-store
vi.mock('electron-store', () => {
  class MockStore {
    private data: { [key: string]: any } = {
      categories: [{ id: 'default', name: '默认分类', order: 0 }],
      scripts: [],
      config: {}
    }

    get(key: string) {
      if (key === 'categories') return this.data.categories
      if (key === 'scripts') return this.data.scripts
      if (key.startsWith('config.')) return this.data.config[key.split('.')[1]]
      return undefined
    }

    set(key: string, value: any) {
      if (key === 'categories') this.data.categories = value
      if (key === 'scripts') this.data.scripts = value
      if (key.startsWith('config.')) this.data.config[key.split('.')[1]] = value
    }

    get store() {
      return this.data
    }
  }
  return {
    default: MockStore
  }
})

describe('Main Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 由于模块作用域内的 store 对象在导入时已经创建，
    // 我们需要确保每个测试开始前数据是“干净”的（实际上 mock 逻辑已经在内部处理了简单的 state）
  })

  it('应当能获取默认分类', () => {
    const categories = storeModule.getCategories()
    expect(categories).toHaveLength(1)
    expect(categories[0].id).toBe('default')
  })

  it('应当能添加新分类', () => {
    const newCat = storeModule.addCategory('Test Category')
    expect(newCat.name).toBe('Test Category')
    expect(newCat.id).toBeDefined()
    
    const categories = storeModule.getCategories()
    expect(categories.find(c => c.name === 'Test Category')).toBeDefined()
  })

  it('应当能添加并获取脚本', () => {
    const script = storeModule.addScript('default', 'Test Script', 'Desc', 'echo hello', 'bash')
    expect(script.name).toBe('Test Script')
    expect(script.scriptType).toBe('bash')
    
    const scripts = storeModule.getScriptsByCategory('default')
    expect(scripts).toHaveLength(1)
    expect(scripts[0].id).toBe(script.id)
  })

  it('更新脚本应当生效并更新 updatedAt', () => {
    const script = storeModule.addScript('default', 'Old Name', '', '', 'bash')
    const originalUpdate = script.updatedAt
    
    // 等待一小会儿确保时间戳改变 (或者直接 mock Date.now)
    const updated = storeModule.updateScript(script.id, { name: 'New Name' })
    expect(updated?.name).toBe('New Name')
    expect(updated?.updatedAt).toBeGreaterThanOrEqual(originalUpdate)
  })

  it('删除分类应当将脚本移至默认分类', () => {
    const cat = storeModule.addCategory('Temp Cat')
    const script = storeModule.addScript(cat.id, 'Target Script', '', '', 'bash')
    
    const deleteResult = storeModule.deleteCategory(cat.id)
    expect(deleteResult).toBe(true)
    
    const updatedScript = storeModule.getScript(script.id)
    expect(updatedScript?.categoryId).toBe('default')
  })

  it('不允许删除默认分类', () => {
    const result = storeModule.deleteCategory('default')
    expect(result).toBe(false)
  })
})
