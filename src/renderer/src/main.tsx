import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import App from './App'
import './styles/index.css'

// 自定义暗色紫色主题
const theme = createTheme({
    primaryColor: 'violet',
    colors: {
        violet: [
            '#f3f0ff',
            '#e5dbff',
            '#d0bfff',
            '#b197fc',
            '#9775fa',
            '#8B7EC8', // 主色 - 低饱和度高级紫
            '#7c6bb8',
            '#6d5ca8',
            '#5e4d98',
            '#4f3e88'
        ]
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    defaultRadius: 'md'
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <MantineProvider theme={theme} defaultColorScheme="dark">
        <App />
    </MantineProvider>
)
