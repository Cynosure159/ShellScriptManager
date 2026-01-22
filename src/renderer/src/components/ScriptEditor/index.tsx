import { useEffect, useRef } from 'react'
import { Button, Select, ActionIcon, Group, Tooltip } from '@mantine/core'
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
            // 只在有编辑脚本时响应
            if (!editingScript) return

            // 获取组合键状态
            const isCtrlOrCmd = e.ctrlKey || e.metaKey

            // Ctrl+S: 保存
            if (isCtrlOrCmd && e.key === 's') {
                e.preventDefault()
                // 如果已修改，则执行保存
                if (useAppStore.getState().isScriptModified) {
                    saveScript()
                }
            }

            // Ctrl+R: 运行
            if (isCtrlOrCmd && e.key === 'r') {
                e.preventDefault()
                // 如果当前没在运行，则运行
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

        // 清理旧的编辑器实例
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
                '&': { height: '100%' },
                '.cm-scroller': { overflow: 'auto' },
                '.cm-content': { fontFamily: 'Consolas, Monaco, monospace', fontSize: '14px' }
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

                <Group gap="xs">
                    {/* 分类选择 */}
                    <Select
                        size="xs"
                        style={{ width: 130 }}
                        data={categories.map(c => ({ value: c.id, label: c.name }))}
                        value={editingScript.categoryId}
                        onChange={(value) => value && updateEditingScript({ categoryId: value })}
                    />

                    {/* 主要操作按钮：保存、运行 */}
                    <div className="editor-actions">
                        <Tooltip label="保存脚本 (Ctrl+S)" position="bottom" withArrow>
                            <Button
                                size="xs"
                                variant="subtle"
                                disabled={!isScriptModified}
                                onClick={() => saveScript()}
                            >
                                保存
                            </Button>
                        </Tooltip>
                        {isRunning ? (
                            <Button
                                size="xs"
                                color="red"
                                onClick={() => stopScript()}
                            >
                                停止
                            </Button>
                        ) : (
                            <Tooltip label="运行脚本 (Ctrl+R)" position="bottom" withArrow>
                                <Button
                                    size="xs"
                                    color="violet"
                                    onClick={() => runScript()}
                                >
                                    运行
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                </Group>
            </div>

            {/* 2. 中部：编辑器工具栏 (自动换行 | 脚本类型) */}
            <div style={{
                padding: '8px 16px',
                borderBottom: '1px solid #2c2e33',
                backgroundColor: '#1f2023',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* 左侧：自动换行 */}
                <Group gap={8} style={{ cursor: 'pointer' }} onClick={() => toggleWordWrap()}>
                    <ActionIcon
                        variant={wordWrap ? 'light' : 'subtle'}
                        color="violet"
                        size="xs"
                        style={{ pointerEvents: 'none' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 6h16M4 12h13a3 3 0 0 1 0 6h-4" />
                            <path d="M13 15l-3 3 3 3" />
                        </svg>
                    </ActionIcon>
                    <span style={{ fontSize: '12px', color: wordWrap ? '#8B7EC8' : '#909296', userSelect: 'none' }}>
                        自动换行
                    </span>
                </Group>

                {/* 右侧：脚本类型 */}
                <Group gap={8}>
                    <span style={{ fontSize: '12px', color: '#909296' }}>类型:</span>
                    <Select
                        size="xs"
                        style={{ width: 130 }}
                        data={getScriptTypeOptions()}
                        value={editingScript.scriptType || 'batch'}
                        onChange={(value) => value && updateEditingScript({ scriptType: value as ScriptType })}
                    />
                </Group>
            </div>

            {/* 3. 底部：编辑器容器 */}
            <div className="editor-container" ref={editorRef} />
        </div>
    )
}
