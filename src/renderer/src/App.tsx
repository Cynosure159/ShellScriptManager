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
    const isDragging = useRef(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // 初始化加载数据
    useEffect(() => {
        loadData()
    }, [loadData])

    // 处理拖拽开始
    const handleDragStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        isDragging.current = true
        document.body.style.cursor = 'row-resize'
        document.body.style.userSelect = 'none'
    }, [])

    // 处理拖拽移动
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current || !containerRef.current) return

            const containerRect = containerRef.current.getBoundingClientRect()
            const newHeight = containerRect.bottom - e.clientY

            // 限制最小和最大高度
            const clampedHeight = Math.max(100, Math.min(500, newHeight))
            setTerminalHeight(clampedHeight)
        }

        const handleMouseUp = () => {
            isDragging.current = false
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
            <Sidebar />

            {/* 脚本列表 */}
            {selectedCategoryId && <ScriptList />}

            {/* 主内容区 */}
            <div className="main-content" ref={containerRef}>
                <ScriptEditor />

                {/* 可拖拽分隔条 */}
                <div
                    className="resize-handle"
                    onMouseDown={handleDragStart}
                />

                <Terminal height={terminalHeight} />
            </div>
        </div>
    )
}
