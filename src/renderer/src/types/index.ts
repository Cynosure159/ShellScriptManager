/**
 * 脚本类型
 */
export type ScriptType = 'bash' | 'batch' | 'powershell'

/**
 * 脚本分类接口
 */
export interface Category {
  id: string
  name: string
  order: number
}

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
  workDir?: string
  order?: number
  createdAt: number
  updatedAt: number
}

/**
 * 应用数据接口
 */
export interface AppData {
  categories: Category[]
  scripts: Script[]
}

/**
 * 脚本执行结果接口
 */
export interface ScriptExecutionResult {
  success: boolean
  exitCode: number | null
  signal: string | null
}
