import { useEffect, useState, useCallback, useRef } from 'react'
import Sidebar from './components/Sidebar'
import ScriptList from './components/ScriptList'
import ScriptEditor from './components/ScriptEditor'
import Terminal from './components/Terminal'
import { useAppStore } from './stores/appStore'

/**
 * 主应用组件
 */
export default function App() {
    const { loadData, selectedCategoryId } = useAppStore()
    const [terminalHeight, setTerminalHeight] = useState(200)
    const [scriptListWidth, setScriptListWidth] = useState(280)
    const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(false)

    // 记录拖拽目标: 'terminal' | 'scriptList' | null
    const resizeTarget = useRef<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // 初始化加载数据
    useEffect(() => {
        loadData()
    }, [loadData])

    // 处理拖拽开始
    const handleDragStart = useCallback((target: 'terminal' | 'scriptList') => (e: React.MouseEvent) => {
        e.preventDefault()
        resizeTarget.current = target
        document.body.style.cursor = target === 'terminal' ? 'row-resize' : 'col-resize'
        document.body.style.userSelect = 'none'
    }, [])

    // 处理拖拽移动
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizeTarget.current) return

            if (resizeTarget.current === 'terminal' && containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect()
                const newHeight = containerRect.bottom - e.clientY
                // 限制终端高度: 最小 100，最大 500
                const clampedHeight = Math.max(100, Math.min(500, newHeight))
                setTerminalHeight(clampedHeight)
            } else if (resizeTarget.current === 'scriptList') {
                const sidebarWidth = isCategoryCollapsed ? 60 : 200
                const newWidth = e.clientX - sidebarWidth // 减去 Sidebar 宽度
                // 限制列表宽度: 最小 200，最大 600
                const clampedWidth = Math.max(200, Math.min(600, newWidth))
                setScriptListWidth(clampedWidth)
            }
        }

        const handleMouseUp = () => {
            resizeTarget.current = null
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    return (
        <div className="app-layout">
            {/* 分类侧边栏 */}
            <Sidebar
                isCollapsed={isCategoryCollapsed}
                onToggleCollapse={() => setIsCategoryCollapsed(!isCategoryCollapsed)}
            />

            {/* 脚本列表 (带拖拽条) */}
            {selectedCategoryId && (
                <>
                    <ScriptList width={scriptListWidth} />
                    <div
                        className="resize-handle-vertical"
                        onMouseDown={handleDragStart('scriptList')}
                    />
                </>
            )}

            {/* 主内容区 */}
            <div className="main-content" ref={containerRef}>
                <ScriptEditor />

                {/* 可拖拽分隔条 (终端) */}
                <div
                    className="resize-handle"
                    onMouseDown={handleDragStart('terminal')}
                />

                <Terminal height={terminalHeight} />
            </div>
        </div>
    )
}
