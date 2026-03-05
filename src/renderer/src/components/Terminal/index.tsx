import { useEffect, useRef } from 'react'
import { Tooltip } from '@mantine/core'
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
                background: '#191919',
                foreground: '#DDDDDD',
                cursor: '#CCCCCC',
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

    // 监听 terminalOutput 清空事件
    useEffect(() => {
        const unsub = useAppStore.subscribe((state, prevState) => {
            if (state.terminalOutput === '' && prevState.terminalOutput !== '') {
                xtermRef.current?.clear()
            }
        })
        return unsub
    }, [])

    // 监听脚本实时输出 (Stream)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
        }

        const unsubscribe = window.api.onScriptOutput((_scriptId, output) => {
            xtermRef.current?.write(output)
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

    // 保存日志
    const handleSaveLog = async () => {
        const output = useAppStore.getState().terminalOutput
        if (!output) return
        await window.api.saveTerminalOutput(output, editingScript?.name)
    }

    return (
        <div className="terminal-panel" style={{ height }}>
            <div className="terminal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <span className="terminal-title" style={{ whiteSpace: 'nowrap' }}>
                        输出 {runningScriptId ? '(运行中...)' : ''}
                    </span>

                    {editingScript && (
                        <div className="workdir-box" style={{ flex: 1, maxWidth: 280 }}>
                            <input
                                type="text"
                                placeholder="运行目录 (默认: User Home)"
                                value={editingScript.workDir || ''}
                                onChange={(e) => updateEditingScript({ workDir: e.target.value })}
                                title="手动输入或点击右侧按钮选择目录"
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#666',
                                    fontSize: 11,
                                    minWidth: 0
                                }}
                            />
                            <button
                                className="icon-btn"
                                onClick={handleSelectWorkDir}
                                title="浏览文件夹"
                                style={{ padding: 2, color: '#666' }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                                    <path d="M22,19a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V5A2,2,0,0,1,4,3H9l2,3h9a2,2,0,0,1,2,2Z"></path>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <Tooltip label="保存日志" position="bottom" withArrow>
                        <button
                            className="icon-btn"
                            onClick={handleSaveLog}
                            style={{ color: '#555' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                        </button>
                    </Tooltip>
                    <Tooltip label="清空输出" position="bottom" withArrow>
                        <button
                            className="icon-btn"
                            onClick={() => clearTerminalOutput()}
                            style={{ color: '#555' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3,6 5,6 21,6" />
                                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                            </svg>
                        </button>
                    </Tooltip>
                </div>
            </div>
            <div className="terminal-container" ref={terminalRef} />
        </div>
    )
}
