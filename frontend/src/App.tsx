import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import SimpleWalletConnect from './components/wallet/SimpleWalletConnect'

// 页面组件
import TransactionAnalysis from './pages/TransactionAnalysis'
import RiskAssessment from './pages/RiskAssessment'
import WalletTracking from './pages/WalletTracking'
import Settings from './pages/Settings'

// 测试组件
import { EnvTest } from './components/EnvTest'

// 第一步：恢复原始布局结构
function App() {
  console.log('App组件开始渲染 - 恢复原始布局结构')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/transactions" replace />} />
            <Route path="/transactions" element={<TransactionAnalysis />} />
            <Route path="/risk" element={<RiskAssessment />} />
            <Route path="/wallets" element={<WalletTracking />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/env-test" element={<EnvTest />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
