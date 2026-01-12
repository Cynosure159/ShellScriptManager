import { ActionIcon } from '@mantine/core'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useAppStore } from '../../stores/appStore'

/**
 * 脚本列表组件
 */
export default function ScriptList() {
    const {
        scripts,
        selectedCategoryId,
        selectedScriptId,
        selectScript,
        addScript,
        deleteScript,
        reorderScripts
    } = useAppStore()

    // 过滤当前分类的脚本
    const filteredScripts = scripts.filter(s => s.categoryId === selectedCategoryId)

    // 删除脚本
    const handleDeleteScript = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (confirm('确定要删除该脚本吗？')) {
            await deleteScript(id)
        }
    }

    // 拖拽结束处理
    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination || !selectedCategoryId) return

        const sourceIndex = result.source.index
        const destinationIndex = result.destination.index

        if (sourceIndex === destinationIndex) return

        await reorderScripts(selectedCategoryId, sourceIndex, destinationIndex)
    }

    return (
        <div className="script-list-panel">
            <div className="script-list-header">
                <span className="script-list-title">脚本</span>
                <ActionIcon
                    variant="subtle"
                    color="violet"
                    size="sm"
                    onClick={() => addScript()}
                    title="添加脚本"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </ActionIcon>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="script-list">
                    {(provided) => (
                        <div
                            className="script-list"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {filteredScripts.length === 0 ? (
                                <div className="empty-state" style={{ padding: '24px' }}>
                                    <div className="empty-state-text">暂无脚本</div>
                                </div>
                            ) : (
                                filteredScripts.map((script, index) => (
                                    <Draggable key={script.id} draggableId={script.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    opacity: snapshot.isDragging ? 0.8 : 1
                                                }}
                                                className={`script-item ${selectedScriptId === script.id ? 'active' : ''} ${snapshot.isDragging ? 'dragging' : ''}`}
                                                onClick={() => selectScript(script.id)}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div className="script-name">{script.name}</div>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="gray"
                                                        size="md"
                                                        className="icon-btn danger"
                                                        onClick={(e) => handleDeleteScript(e, script.id)}
                                                        title="删除脚本"
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="3,6 5,6 21,6" />
                                                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                                                        </svg>
                                                    </ActionIcon>
                                                </div>
                                                <div className="script-description">{script.description || '暂无备注'}</div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    )
}
