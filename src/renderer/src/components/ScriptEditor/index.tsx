import { useEffect, useRef } from 'react'
import { Button, Select } from '@mantine/core'
import { EditorView, basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { useAppStore } from '../../stores/appStore'
import type { ScriptType } from '../../types'

// 脚本类型选项
const scriptTypeOptions = [
    { value: 'batch', label: 'Batch (cmd)' },
    // { value: 'powershell', label: 'PowerShell' },  // 后续可启用
    // { value: 'bash', label: 'Bash' },              // 后续可启用
]

/**
 * 脚本编辑器组件
 */
export default function ScriptEditor() {
    const {
        categories,
        editingScript,
        isScriptModified,
        runningScriptId,
        updateEditingScript,
        saveScript,
        runScript,
        stopScript
    } = useAppStore()

    const editorRef = useRef<HTMLDivElement>(null)
    const editorViewRef = useRef<EditorView | null>(null)

    // 初始化 CodeMirror 编辑器
    useEffect(() => {
        if (!editorRef.current) return

        // 清理旧的编辑器实例
        if (editorViewRef.current) {
            editorViewRef.current.destroy()
        }

        const view = new EditorView({
            doc: editingScript?.content || '',
            extensions: [
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
            ],
            parent: editorRef.current
        })

        editorViewRef.current = view

        return () => {
            view.destroy()
        }
    }, [editingScript?.id])

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
            {/* 编辑器头部 */}
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

                {/* 脚本类型选择 */}
                <Select
                    size="xs"
                    style={{ width: 120 }}
                    data={scriptTypeOptions}
                    value={editingScript.scriptType || 'batch'}
                    onChange={(value) => value && updateEditingScript({ scriptType: value as ScriptType })}
                />

                {/* 分类选择 */}
                <Select
                    size="xs"
                    style={{ width: 120 }}
                    data={categories.map(c => ({ value: c.id, label: c.name }))}
                    value={editingScript.categoryId}
                    onChange={(value) => value && updateEditingScript({ categoryId: value })}
                />

                {/* 操作按钮 */}
                <div className="editor-actions">
                    <Button
                        size="xs"
                        variant="subtle"
                        disabled={!isScriptModified}
                        onClick={() => saveScript()}
                    >
                        保存
                    </Button>
                    {isRunning ? (
                        <Button
                            size="xs"
                            color="red"
                            onClick={() => stopScript()}
                        >
                            停止
                        </Button>
                    ) : (
                        <Button
                            size="xs"
                            color="violet"
                            onClick={() => runScript()}
                        >
                            运行
                        </Button>
                    )}
                </div>
            </div>

            {/* 编辑器容器 */}
            <div className="editor-container" ref={editorRef} />
        </div>
    )
}
