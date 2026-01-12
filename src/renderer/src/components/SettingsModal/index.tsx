import { Modal, TextInput, Group, Button, ActionIcon } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useAppStore } from '../../stores/appStore'

interface SettingsModalProps {
    opened: boolean
    onClose: () => void
}

export default function SettingsModal({ opened, onClose }: SettingsModalProps) {
    const { defaultWorkDir, updateDefaultWorkDir } = useAppStore()
    const [workDir, setWorkDir] = useState(defaultWorkDir)

    useEffect(() => {
        if (opened) {
            setWorkDir(defaultWorkDir)
        }
    }, [opened, defaultWorkDir])

    const handleSelectDir = async () => {
        const path = await window.api.selectDirectory()
        if (path) {
            setWorkDir(path)
        }
    }

    const handleSave = async () => {
        await updateDefaultWorkDir(workDir)
        onClose()
    }

    return (
        <Modal opened={opened} onClose={onClose} title="应用设置" centered>
            <TextInput
                label="默认运行根目录"
                description="新建脚本时自动填充的运行目录"
                placeholder="例如: C:\Projects"
                value={workDir}
                onChange={(e) => setWorkDir(e.target.value)}
                mb="md"
                rightSection={
                    <ActionIcon onClick={handleSelectDir} title="浏览">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22,19a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V5A2,2,0,0,1,4,3H9l2,3h9a2,2,0,0,1,2,2Z"></path>
                        </svg>
                    </ActionIcon>
                }
            />

            <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={onClose}>取消</Button>
                <Button onClick={handleSave} color="violet">保存</Button>
            </Group>
        </Modal>
    )
}
