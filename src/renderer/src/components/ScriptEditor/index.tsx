import { useEffect, useRef } from 'react'
import { Select, Tooltip } from '@mantine/core'
import { EditorView, basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { useAppStore } from '../../stores/appStore'
import type { ScriptType } from '../../types'

// 根据平台生成脚本类型选项
const getScriptTypeOptions = () => {
    const isWindows = window.api.platform === 'win32'
    if (isWindows) {
        return [
            { value: 'batch', label: 'Batch (cmd)' },
            { value: 'powershell', label: 'PowerShell' },
        ]
    } else {
        return [
            { value: 'bash', label: 'Bash' },
        ]
    }
}

/**
 * 脚本编辑器组件
 */
export default function ScriptEditor() {
    const {
        categories,
        editingScript,
        isScriptModified,
        runningScriptId,
        wordWrap,
        updateEditingScript,
        saveScript,
        runScript,
        stopScript,
        toggleWordWrap
    } = useAppStore()

    const editorRef = useRef<HTMLDivElement>(null)
    const editorViewRef = useRef<EditorView | null>(null)

    // 注册快捷键
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!editingScript) return

            const isCtrlOrCmd = e.ctrlKey || e.metaKey

            // Ctrl+S: 保存
            if (isCtrlOrCmd && e.key === 's') {
                e.preventDefault()
                if (useAppStore.getState().isScriptModified) {
                    saveScript()
                }
            }

            // Ctrl+R: 运行
            if (isCtrlOrCmd && e.key === 'r') {
                e.preventDefault()
                if (!useAppStore.getState().runningScriptId) {
                    runScript()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [editingScript?.id, saveScript, runScript])

    // 初始化 CodeMirror 编辑器
    useEffect(() => {
        if (!editorRef.current) return

        if (editorViewRef.current) {
            editorViewRef.current.destroy()
        }

        const extensions = [
            basicSetup,
            javascript(),
            oneDark,
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    const content = update.state.doc.toString()
                    updateEditingScript({ content })
                }
            }),
            EditorView.theme({
                '&': { height: '100%', backgroundColor: '#1F1F23' },
                '.cm-scroller': { overflow: 'auto' },
                '.cm-content': { fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px' },
                '.cm-gutters': { backgroundColor: '#1F1F23', border: 'none', color: '#444' },
                '.cm-activeLineGutter': { backgroundColor: '#28273A' },
                '.cm-activeLine': { backgroundColor: '#28273A' }
            })
        ]

        // 根据状态添加自动换行
        if (wordWrap) {
            extensions.push(EditorView.lineWrapping)
        }

        const view = new EditorView({
            doc: editingScript?.content || '',
            extensions,
            parent: editorRef.current
        })

        editorViewRef.current = view

        return () => {
            view.destroy()
        }
    }, [editingScript?.id, wordWrap])

    // 当没有选中脚本时显示空状态
    if (!editingScript) {
        return (
            <div className="editor-panel">
                <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <div className="empty-state-text">请选择或创建一个脚本</div>
                </div>
            </div>
        )
    }

    const isRunning = runningScriptId === editingScript.id

    return (
        <div className="editor-panel">
            {/* 1. 顶部：脚本信息与主要操作 */}
            <div className="editor-header">
                <div className="editor-info">
                    <input
                        className="editor-name-input"
                        type="text"
                        value={editingScript.name}
                        onChange={(e) => updateEditingScript({ name: e.target.value })}
                        placeholder="脚本名称"
                    />
                    <input
                        className="editor-desc-input"
                        type="text"
                        value={editingScript.description}
                        onChange={(e) => updateEditingScript({ description: e.target.value })}
                        placeholder="添加备注..."
                    />
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* 分类选择 */}
                    <Select
                        size="xs"
                        style={{ width: 110 }}
                        data={categories.map(c => ({ value: c.id, label: c.name }))}
                        value={editingScript.categoryId}
                        onChange={(value) => value && updateEditingScript({ categoryId: value })}
                        styles={{
                            input: {
                                backgroundColor: '#2E2E32',
                                borderColor: 'transparent',
                                color: '#AAAAAA',
                                fontSize: 12,
                                borderRadius: 8,
                                height: 32,
                                minHeight: 32,
                            }
                        }}
                    />

                    {/* 保存按钮 */}
                    <Tooltip label="保存脚本 (Ctrl+S)" position="bottom" withArrow>
                        <button
                            className="btn-save"
                            disabled={!isScriptModified}
                            onClick={() => saveScript()}
                        >
                            保存
                        </button>
                    </Tooltip>

                    {/* 运行/停止按钮 */}
                    {isRunning ? (
                        <button className="btn-stop" onClick={() => stopScript()}>
                            停止
                        </button>
                    ) : (
                        <Tooltip label="运行脚本 (Ctrl+R)" position="bottom" withArrow>
                            <button className="btn-run" onClick={() => runScript()}>
                                运行
                            </button>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* 2. 中部：编辑器工具栏 (自动换行 | 脚本类型) */}
            <div className="editor-toolbar">
                {/* 左侧：自动换行 */}
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    onClick={() => toggleWordWrap()}
                >
                    <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke={wordWrap ? '#8B7EC8' : '#777'}
                        strokeWidth="2"
                    >
                        <path d="M4 6h16M4 12h13a3 3 0 0 1 0 6h-4" />
                        <path d="M13 15l-3 3 3 3" />
                    </svg>
                    <span className={`toolbar-label ${wordWrap ? 'active' : ''}`}>
                        自动换行
                    </span>
                </div>

                {/* 右侧：脚本类型 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="toolbar-label">类型:</span>
                    <Select
                        size="xs"
                        style={{ width: 110 }}
                        data={getScriptTypeOptions()}
                        value={editingScript.scriptType || 'batch'}
                        onChange={(value) => value && updateEditingScript({ scriptType: value as ScriptType })}
                        styles={{
                            input: {
                                backgroundColor: '#2E2E32',
                                borderColor: 'transparent',
                                color: '#EAEAEA',
                                fontSize: 12,
                                borderRadius: 6,
                                height: 28,
                                minHeight: 28,
                            }
                        }}
                    />
                </div>
            </div>

            {/* 3. 底部：编辑器容器 */}
            <div className="editor-container" ref={editorRef} />
        </div>
    )
}
