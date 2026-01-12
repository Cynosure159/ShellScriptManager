import { useState } from 'react'
import { ActionIcon, TextInput, Modal, Button, Group } from '@mantine/core'
import { useAppStore } from '../../stores/appStore'
import SettingsModal from '../SettingsModal'

/**
 * 分类侧边栏组件
 */
export default function Sidebar() {
    const {
        categories,
        scripts,
        selectedCategoryId,
        selectCategory,
        addCategory,
        updateCategory,
        deleteCategory,
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

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <span className="sidebar-title">分类</span>
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
            </div>

            <div className="category-list">
                {categories.map(category => (
                    <div
                        key={category.id}
                        className={`category-item ${selectedCategoryId === category.id ? 'active' : ''}`}
                        onClick={() => selectCategory(category.id)}
                        onDoubleClick={() => category.id !== 'default' && openEditModal(category)}
                    >
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">{getScriptCount(category.id)}</span>
                    </div>
                ))}
            </div>

            {/* 底部操作按钮 */}
            <div style={{ padding: '12px', borderTop: '1px solid #2c2e33' }}>
                <Group gap="xs" mb="xs">
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
                <Button
                    variant="light"
                    color="gray"
                    size="xs"
                    fullWidth
                    leftSection={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    }
                    onClick={() => setIsSettingsOpen(true)}
                >
                    全局设置
                </Button>
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
