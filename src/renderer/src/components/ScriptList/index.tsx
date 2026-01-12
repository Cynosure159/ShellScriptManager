import { ActionIcon } from '@mantine/core'
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
        deleteScript
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

            <div className="script-list">
                {filteredScripts.length === 0 ? (
                    <div className="empty-state" style={{ padding: '24px' }}>
                        <div className="empty-state-text">暂无脚本</div>
                    </div>
                ) : (
                    filteredScripts.map(script => (
                        <div
                            key={script.id}
                            className={`script-item ${selectedScriptId === script.id ? 'active' : ''}`}
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
                    ))
                )}
            </div>
        </div>
    )
}
