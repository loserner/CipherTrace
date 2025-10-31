import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'

console.log('main.tsx 开始执行 - 不使用 Wagmi 配置')

// 检查根元素是否存在
const rootElement = document.getElementById('root')
console.log('根元素:', rootElement)

if (!rootElement) {
  console.error('找不到根元素 #root')
  document.body.innerHTML = '<div style="padding: 20px; color: red;">错误：找不到根元素 #root</div>'
} else {
  console.log('开始渲染 React 应用 - 不使用 Wagmi 配置')
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  )
  console.log('React 应用渲染完成')
}
