import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ConfigProvider } from 'antd'
import { LightTheme, Fonts } from '@/contants/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: LightTheme.colors.primary,
          colorBgLayout: LightTheme.colors.background,
          colorTextBase: LightTheme.colors.text,
          fontFamily: Fonts,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
