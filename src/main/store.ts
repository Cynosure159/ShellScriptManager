import Store from 'electron-store'
import { v4 as uuidv4 } from 'uuid'

/**
 * 脚本分类接口
 */
export interface Category {
  id: string
  name: string
  order: number
}

/**
 * 脚本类型
 */
export type ScriptType = 'bash' | 'batch' | 'powershell'

/**
 * 脚本接口
 */
export interface Script {
  id: string
  categoryId: string
  name: string
  description: string
  content: string
  scriptType: ScriptType
  createdAt: number
  updatedAt: number
}

/**
 * 应用数据结构
 */
interface AppData {
  categories: Category[]
  scripts: Script[]
}

// 创建 store 实例
const store = new Store<AppData>({
  defaults: {
    categories: [
      { id: 'default', name: '默认分类', order: 0 }
    ],
    scripts: []
  }
})

/**
 * 获取所有分类
 */
export function getCategories(): Category[] {
  return store.get('categories')
}

/**
 * 添加分类
 */
export function addCategory(name: string): Category {
  const categories = getCategories()
  const newCategory: Category = {
    id: uuidv4(),
    name,
    order: categories.length
  }
  categories.push(newCategory)
  store.set('categories', categories)
  return newCategory
}

/**
 * 更新分类
 */
export function updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Category | null {
  const categories = getCategories()
  const index = categories.findIndex(c => c.id === id)
  if (index === -1) return null
  categories[index] = {
    ...categories[index],
    ...updates
  }
  store.set('categories', categories)
  return categories[index]
}

/**
 * 删除分类
 */
export function deleteCategory(id: string): boolean {
  if (id === 'default') return false // 不能删除默认分类
  const categories = getCategories()
  const filtered = categories.filter(c => c.id !== id)
  if (filtered.length === categories.length) return false
  store.set('categories', filtered)
  
  // 将该分类下的脚本移到默认分类
  const scripts = getScripts()
  const updatedScripts = scripts.map(s => 
    s.categoryId === id ? { ...s, categoryId: 'default' } : s
  )
  store.set('scripts', updatedScripts)
  
  return true
}

/**
 * 获取所有脚本
 */
export function getScripts(): Script[] {
  return store.get('scripts')
}

/**
 * 获取指定分类的脚本
 */
export function getScriptsByCategory(categoryId: string): Script[] {
  return getScripts().filter(s => s.categoryId === categoryId)
}

/**
 * 获取单个脚本
 */
export function getScript(id: string): Script | undefined {
  return getScripts().find(s => s.id === id)
}

/**
 * 添加脚本
 */
export function addScript(categoryId: string, name: string, description: string, content: string, scriptType: ScriptType = 'batch'): Script {
  const scripts = getScripts()
  const now = Date.now()
  const newScript: Script = {
    id: uuidv4(),
    categoryId,
    name,
    description,
    content,
    scriptType,
    createdAt: now,
    updatedAt: now
  }
  scripts.push(newScript)
  store.set('scripts', scripts)
  return newScript
}

/**
 * 更新脚本
 */
export function updateScript(id: string, updates: Partial<Omit<Script, 'id' | 'createdAt'>>): Script | null {
  const scripts = getScripts()
  const index = scripts.findIndex(s => s.id === id)
  if (index === -1) return null
  scripts[index] = {
    ...scripts[index],
    ...updates,
    updatedAt: Date.now()
  }
  store.set('scripts', scripts)
  return scripts[index]
}

/**
 * 删除脚本
 */
export function deleteScript(id: string): boolean {
  const scripts = getScripts()
  const filtered = scripts.filter(s => s.id !== id)
  if (filtered.length === scripts.length) return false
  store.set('scripts', filtered)
  return true
}

// ==================== 全局配置 ====================

export function getConfig(key: string): any {
  return store.get(`config.${key}`)
}

export function setConfig(key: string, value: any): void {
  store.set(`config.${key}`, value)
}

/**
 * 导出所有数据
 */
export function exportData(): object {
  return store.store
}

/**
 * 导入数据
 */
export function importData(data: AppData): boolean {
  try {
    if (!Array.isArray(data.categories) || !Array.isArray(data.scripts)) {
      return false
    }
    store.set('categories', data.categories)
    store.set('scripts', data.scripts)
    return true
  } catch {
    return false
  }
}
