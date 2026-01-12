import { useEffect, useRef } from 'react'
import { ActionIcon, TextInput, Tooltip, Group } from '@mantine/core'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { useAppStore } from '../../stores/appStore'

interface TerminalProps {
    height?: number
}

/**
 * 终端输出组件
 */
export default function Terminal({ height = 200 }: TerminalProps) {
    // 仅获取不需要重渲染的 action
    // 注意：不再从 store 解构 terminalOutput，避免每次追加都触发重渲染
    const {
        clearTerminalOutput,
        runningScriptId,
        editingScript,
        updateEditingScript
    } = useAppStore()

    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<XTerm | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)
    const isInitialMount = useRef(true)

    // 初始化 xterm
    useEffect(() => {
        if (!terminalRef.current) return

        const term = new XTerm({
            theme: {
                background: '#1a1b1e',
                foreground: '#c1c2c5',
                cursor: '#8B7EC8',
                selectionBackground: 'rgba(139, 126, 200, 0.3)'
            },
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: 13,
            cursorBlink: false,
            disableStdin: true,
            convertEol: true
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(terminalRef.current)
        fitAddon.fit()

        xtermRef.current = term
        fitAddonRef.current = fitAddon

        // 初始化时加载已有内容
        const currentOutput = useAppStore.getState().terminalOutput
        if (currentOutput) {
            term.write(currentOutput)
        }

        // 监听窗口大小变化
        const handleResize = () => {
            if (fitAddonRef.current) {
                fitAddonRef.current.fit()
            }
        }
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            term.dispose()
        }
    }, [])

    // 当高度变化时重新 fit
    useEffect(() => {
        if (fitAddonRef.current) {
            setTimeout(() => fitAddonRef.current?.fit(), 0)
        }
    }, [height])

    // 监听 terminalOutput 清空事件 (通过 subscribe)
    // 这是为了处理 "清空" 按钮或 "重新运行" 时的清屏需求
    // 我们只关心是否被清空（变成空字符串），而不关心追加的内容
    useEffect(() => {
        const unsub = useAppStore.subscribe((state, prevState) => {
            if (state.terminalOutput === '' && prevState.terminalOutput !== '') {
                xtermRef.current?.clear()
            }
        })
        return unsub
    }, [])

    // 监听脚本实时输出 (Stream)
    // 直接写入 xterm，并同步到 store (store update 不会触发此组件 UI 更新)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            // 避免 React Strict Mode 下的重复监听问题，虽然生产环境只运行一次
            // 如果已在初始化逻辑中处理，这里不需要做额外保护，
            // 因为 onScriptOutput 返回的 unsubscribe 会正确清理
        }

        const unsubscribe = window.api.onScriptOutput((_scriptId, output) => {
            // 1. 直接写入终端 (高性能)
            xtermRef.current?.write(output)

            // 2. 同步到 Store (用于持久化，不触发组件 UI 更新)
            useAppStore.getState().appendTerminalOutput(output)
        })

        return unsubscribe
    }, [])

    // 选择工作目录
    const handleSelectWorkDir = async () => {
        const path = await window.api.selectDirectory()
        if (path && editingScript) {
            updateEditingScript({ workDir: path })
        }
    }

    return (
        <div className="terminal-panel" style={{ height }}>
            <div className="terminal-header">
                <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                    <span className="terminal-title" style={{ whiteSpace: 'nowrap' }}>
                        输出 {runningScriptId ? '(运行中...)' : ''}
                    </span>

                    {editingScript && (
                        <TextInput
                            size="xs"
                            placeholder="运行目录 (默认: User Home)"
                            value={editingScript.workDir || ''}
                            onChange={(e) => updateEditingScript({ workDir: e.target.value })}
                            rightSection={
                                <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    color="gray"
                                    onClick={handleSelectWorkDir}
                                    title="浏览文件夹"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22,19a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V5A2,2,0,0,1,4,3H9l2,3h9a2,2,0,0,1,2,2Z"></path>
                                    </svg>
                                </ActionIcon>
                            }
                            styles={{
                                root: { flex: 1, maxWidth: 300 },
                                input: {
                                    height: 22,
                                    minHeight: 22,
                                    backgroundColor: '#25262b',
                                    borderColor: '#373A40',
                                    color: '#909296',
                                    fontSize: 12
                                }
                            }}
                        />
                    )}
                </Group>

                <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => clearTerminalOutput()}
                    title="清空输出"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                    </svg>
                </ActionIcon>
            </div>
            <div className="terminal-container" ref={terminalRef} />
        </div>
    )
}
