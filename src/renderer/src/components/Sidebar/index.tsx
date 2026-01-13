import { useState } from 'react'
import { ActionIcon, TextInput, Modal, Button, Group } from '@mantine/core'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useAppStore } from '../../stores/appStore'
import SettingsModal from '../SettingsModal'

interface SidebarProps {
    isCollapsed: boolean
    onToggleCollapse: () => void
}

/**
 * 分类侧边栏组件
 */
export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
    const {
        categories,
        scripts,
        selectedCategoryId,
        selectCategory,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        exportData,
        importData
    } = useAppStore()

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [categoryName, setCategoryName] = useState('')
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)

    // 获取分类下的脚本数量
    const getScriptCount = (categoryId: string) => {
        return scripts.filter(s => s.categoryId === categoryId).length
    }

    // 添加分类
    const handleAddCategory = async () => {
        if (categoryName.trim()) {
            await addCategory(categoryName.trim())
            setCategoryName('')
            setIsAddModalOpen(false)
        }
    }

    // 编辑分类
    const handleEditCategory = async () => {
        if (editingCategoryId && categoryName.trim()) {
            await updateCategory(editingCategoryId, categoryName.trim())
            setCategoryName('')
            setEditingCategoryId(null)
            setIsEditModalOpen(false)
        }
    }

    // 删除分类
    const handleDeleteCategory = async (id: string) => {
        if (id === 'default') return
        if (confirm('确定要删除该分类吗？分类下的脚本将移动到默认分类。')) {
            await deleteCategory(id)
        }
    }

    // 打开编辑弹窗
    const openEditModal = (category: { id: string; name: string }) => {
        setEditingCategoryId(category.id)
        setCategoryName(category.name)
        setIsEditModalOpen(true)
    }

    // 拖拽结束处理
    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return

        const sourceIndex = result.source.index
        const destinationIndex = result.destination.index

        if (sourceIndex === destinationIndex) return

        await reorderCategories(sourceIndex, destinationIndex)
    }

    const defaultCategory = categories.find(c => c.id === 'default')
    const customCategories = categories.filter(c => c.id !== 'default')

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ width: isCollapsed ? 60 : 200, minWidth: isCollapsed ? 60 : 200, position: 'relative' }}>
            <div className="sidebar-header" style={{ justifyContent: 'space-between', padding: isCollapsed ? '16px 0' : '16px' }}>
                <span className="sidebar-title" style={{ display: isCollapsed ? 'none' : 'block' }}>分类</span>
                {isCollapsed && <span className="sidebar-title" style={{ width: '100%', textAlign: 'center', fontSize: '12px' }}>分类</span>}

                {!isCollapsed && (
                    <ActionIcon
                        variant="subtle"
                        color="violet"
                        size="sm"
                        onClick={() => setIsAddModalOpen(true)}
                        title="添加分类"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </ActionIcon>
                )}
            </div>

            <div className="category-list">
                {defaultCategory && (
                    <div
                        key={defaultCategory.id}
                        className={`category-item ${selectedCategoryId === defaultCategory.id ? 'active' : ''}`}
                        onClick={() => selectCategory(defaultCategory.id)}
                        title={isCollapsed ? defaultCategory.name : undefined}
                        style={{ justifyContent: isCollapsed ? 'center' : 'space-between' }}
                    >
                        <span className="category-name" style={{ display: isCollapsed ? 'none' : 'block' }}>{defaultCategory.name}</span>
                        {isCollapsed ? (
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{defaultCategory.name.charAt(0).toUpperCase()}</span>
                        ) : (
                            <span className="category-count">{getScriptCount(defaultCategory.id)}</span>
                        )}
                    </div>
                )}

                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="category-list">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {customCategories.map((category, index) => (
                                    <Draggable key={category.id} draggableId={category.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                                    justifyContent: isCollapsed ? 'center' : 'space-between'
                                                }}
                                                className={`category-item ${selectedCategoryId === category.id ? 'active' : ''} ${snapshot.isDragging ? 'dragging' : ''}`}
                                                onClick={() => selectCategory(category.id)}
                                                onDoubleClick={() => !isCollapsed && openEditModal(category)}
                                                title={isCollapsed ? category.name : undefined}
                                            >
                                                <span className="category-name" style={{ display: isCollapsed ? 'none' : 'block' }}>{category.name}</span>
                                                {isCollapsed ? (
                                                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{category.name.charAt(0).toUpperCase()}</span>
                                                ) : (
                                                    <span className="category-count">{getScriptCount(category.id)}</span>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {/* 底部操作按钮 */}
            <div style={{ padding: '12px', borderTop: '1px solid #2c2e33', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                {!isCollapsed && (
                    <Group gap="xs" style={{ width: '100%' }}>
                        <Button
                            variant="subtle"
                            color="gray"
                            size="xs"
                            style={{ flex: 1 }}
                            onClick={async () => {
                                const result = await importData()
                                if (result.success) {
                                    alert('导入成功')
                                }
                            }}
                        >
                            导入
                        </Button>
                        <Button
                            variant="subtle"
                            color="gray"
                            size="xs"
                            style={{ flex: 1 }}
                            onClick={async () => {
                                const result = await exportData()
                                if (result.success) {
                                    alert('导出成功')
                                }
                            }}
                        >
                            导出
                        </Button>
                    </Group>
                )}

                <Button
                    variant="light"
                    color="gray"
                    size="xs"
                    fullWidth={!isCollapsed}
                    style={{ width: isCollapsed ? '32px' : '100%', padding: isCollapsed ? 0 : undefined }}
                    leftSection={
                        !isCollapsed && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        )
                    }
                    onClick={() => setIsSettingsOpen(true)}
                    title={isCollapsed ? "全局设置" : undefined}
                >
                    {isCollapsed ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    ) : (
                        "全局设置"
                    )}
                </Button>
            </div>

            {/* 折叠/展开按钮 - 贴着边线的左半圆 */}
            <div
                onClick={onToggleCollapse}
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '0',
                    transform: 'translateY(-50%)',
                    zIndex: 100,
                    width: '16px',
                    height: '32px',
                    backgroundColor: '#2c2e33',
                    borderRadius: '32px 0 0 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingLeft: '2px',
                    cursor: 'pointer',
                    border: '1px solid #3d3f47',
                    borderRight: 'none',
                    color: '#909296',
                    transition: 'all 0.2s',
                    boxShadow: '-2px 0 4px rgba(0,0,0,0.1)'
                }}
                className="collapse-handle"
                title={isCollapsed ? "展开侧边栏" : "折叠侧边栏"}
            >
                {isCollapsed ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                )}
            </div>

            {/* 当 Modal 和 SettingsModal 渲染... */}
            <SettingsModal opened={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {/* 添加分类弹窗 */}
            <Modal
                opened={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="添加分类"
                size="sm"
            >
                <TextInput
                    label="分类名称"
                    placeholder="请输入分类名称"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Group mt="md" justify="flex-end">
                    <Button variant="subtle" onClick={() => setIsAddModalOpen(false)}>取消</Button>
                    <Button onClick={handleAddCategory}>确定</Button>
                </Group>
            </Modal>

            {/* 编辑分类弹窗 */}
            <Modal
                opened={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="编辑分类"
                size="sm"
            >
                <TextInput
                    label="分类名称"
                    placeholder="请输入分类名称"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditCategory()}
                />
                <Group mt="md" justify="flex-end">
                    <Button
                        variant="subtle"
                        color="red"
                        onClick={() => {
                            if (editingCategoryId) {
                                handleDeleteCategory(editingCategoryId)
                                setIsEditModalOpen(false)
                            }
                        }}
                        disabled={editingCategoryId === 'default'}
                    >
                        删除
                    </Button>
                    <Button variant="subtle" onClick={() => setIsEditModalOpen(false)}>取消</Button>
                    <Button onClick={handleEditCategory}>保存</Button>
                </Group>
            </Modal>
        </div>
    )
}
