import { useEffect, useRef } from 'react'
import { ActionIcon } from '@mantine/core'
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
    const { terminalOutput, clearTerminalOutput, runningScriptId } = useAppStore()

    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<XTerm | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)

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

    // 监听输出变化
    useEffect(() => {
        if (xtermRef.current) {
            xtermRef.current.clear()
            xtermRef.current.write(terminalOutput)
        }
    }, [terminalOutput])

    // 监听脚本输出事件
    useEffect(() => {
        const unsubscribe = window.api.onScriptOutput((_scriptId, output) => {
            useAppStore.getState().appendTerminalOutput(output)
        })
        return unsubscribe
    }, [])

    return (
        <div className="terminal-panel" style={{ height }}>
            <div className="terminal-header">
                <span className="terminal-title">
                    输出 {runningScriptId ? '(运行中...)' : ''}
                </span>
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
