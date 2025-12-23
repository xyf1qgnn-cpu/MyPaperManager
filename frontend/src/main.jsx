import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import App from './App.jsx'
import './styles/theme.css'
import './index.css'

// Ant Design 深色主题配置
const darkTheme = {
  token: {
    colorPrimary: '#00d4ff',
    colorBgContainer: 'rgba(26, 35, 50, 0.85)',
    colorBgElevated: '#1a2332',
    colorBgLayout: '#0a0f1a',
    colorText: '#e4e8ef',
    colorTextSecondary: '#8892a6',
    colorBorder: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      primaryShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
    },
    Card: {
      colorBgContainer: 'rgba(26, 35, 50, 0.85)',
    },
    Menu: {
      colorItemBg: 'transparent',
      colorSubItemBg: 'transparent',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={darkTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
