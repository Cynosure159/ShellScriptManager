import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Window API
// @ts-ignore
window.api = {
  platform: 'darwin',
  getCategories: vi.fn(),
  addCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  getScripts: vi.fn(),
  getScript: vi.fn(),
  addScript: vi.fn(),
  updateScript: vi.fn(),
  deleteScript: vi.fn(),
  runScript: vi.fn(),
  stopScript: vi.fn(),
  onScriptOutput: vi.fn(),
  exportData: vi.fn(),
  importData: vi.fn(),
  importScriptFile: vi.fn(),
  saveTerminalOutput: vi.fn(),
  // Config & System
  getConfig: vi.fn(),
  setConfig: vi.fn(),
  selectDirectory: vi.fn()
}

// Mock xterm since it needs canvas/DOM parts that might fail in simplified jsdom
vi.mock('@xterm/xterm', () => {
  return {
    Terminal: vi.fn().mockImplementation(() => ({
      loadAddon: vi.fn(),
      open: vi.fn(),
      write: vi.fn(),
      clear: vi.fn(),
      dispose: vi.fn(),
      onData: vi.fn(),
      onKey: vi.fn(),
      resize: vi.fn()
    }))
  }
})

vi.mock('@xterm/addon-fit', () => {
  return {
    FitAddon: vi.fn().mockImplementation(() => ({
      activate: vi.fn(),
      fit: vi.fn()
    }))
  }
})
