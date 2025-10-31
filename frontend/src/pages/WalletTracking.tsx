import React, { useState, useEffect } from 'react'
import { blockchainService } from '../services/blockchain'

interface TrackedWallet {
  address: string
  name: string
  balance: string
  riskLevel: string
  lastActivity: string
  transactionCount: number
}

const WalletTracking = () => {
  const [trackedWallets, setTrackedWallets] = useState<TrackedWallet[]>([])
  const [loading, setLoading] = useState(false)
  const [newWallet, setNewWallet] = useState('')

  // 从 localStorage 加载追踪的钱包列表
  useEffect(() => {
    const loadTrackedWallets = async () => {
      try {
        const savedWallets = localStorage.getItem('trackedWallets')
        if (savedWallets) {
          const wallets = JSON.parse(savedWallets)
          setTrackedWallets(wallets)
          
          // 自动刷新所有钱包数据
          if (wallets.length > 0) {
            setLoading(true)
            try {
              const updatedWallets = await Promise.all(
                wallets.map(wallet => fetchWalletData(wallet.address))
              )
              setTrackedWallets(updatedWallets)
              saveTrackedWallets(updatedWallets)
            } catch (error) {
              console.error('自动刷新钱包数据失败:', error)
            } finally {
              setLoading(false)
            }
          }
        }
      } catch (error) {
        console.error('加载追踪钱包失败:', error)
      }
    }

    loadTrackedWallets()
  }, [])

  // 保存追踪的钱包列表到 localStorage
  const saveTrackedWallets = (wallets: TrackedWallet[]) => {
    try {
      localStorage.setItem('trackedWallets', JSON.stringify(wallets))
    } catch (error) {
      console.error('保存追踪钱包失败:', error)
    }
  }

  // 获取钱包真实数据
  const fetchWalletData = async (address: string): Promise<TrackedWallet> => {
    try {
      const [balance, stats, transactions] = await Promise.all([
        blockchainService.getETHBalance(address),
        blockchainService.getWalletStats(address),
        blockchainService.getWalletTransactions(address, 1)
      ])

      const lastActivity = transactions.length > 0 
        ? new Date(transactions[0].timestamp).toLocaleString('zh-CN')
        : '无活动'

      const riskLevel = stats.riskTransactions > 5 ? 'high' : 
                       stats.riskTransactions > 0 ? 'medium' : 'low'

      return {
        address,
        name: `钱包 ${address.slice(0, 6)}...${address.slice(-4)}`,
        balance: `${balance} ETH`,
        riskLevel,
        lastActivity,
        transactionCount: stats.totalTransactions
      }
    } catch (error) {
      console.error('获取钱包数据失败:', error)
      return {
        address,
        name: `钱包 ${address.slice(0, 6)}...${address.slice(-4)}`,
        balance: '0 ETH',
        riskLevel: 'unknown',
        lastActivity: '获取失败',
        transactionCount: 0
      }
    }
  }

  const addWallet = async () => {
    if (newWallet.trim()) {
      // 检查是否已经存在
      const exists = trackedWallets.some(wallet => 
        wallet.address.toLowerCase() === newWallet.toLowerCase()
      )
      
      if (exists) {
        alert('该钱包地址已经在追踪列表中')
        return
      }

      setLoading(true)
      try {
        const walletData = await fetchWalletData(newWallet)
        const updatedWallets = [...trackedWallets, walletData]
        setTrackedWallets(updatedWallets)
        saveTrackedWallets(updatedWallets)
        setNewWallet('')
      } catch (error) {
        console.error('添加钱包失败:', error)
        alert('添加钱包失败，请检查地址是否正确')
      } finally {
        setLoading(false)
      }
    }
  }

  // 刷新所有钱包数据
  const refreshWallets = async () => {
    setLoading(true)
    try {
      const updatedWallets = await Promise.all(
        trackedWallets.map(wallet => fetchWalletData(wallet.address))
      )
      setTrackedWallets(updatedWallets)
      saveTrackedWallets(updatedWallets)
    } catch (error) {
      console.error('刷新钱包数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 移除钱包
  const removeWallet = (index: number) => {
    const wallet = trackedWallets[index]
    if (confirm(`确定要移除钱包 ${wallet.name} 吗？`)) {
      const updatedWallets = trackedWallets.filter((_, i) => i !== index)
      setTrackedWallets(updatedWallets)
      saveTrackedWallets(updatedWallets)
    }
  }

  // 清除所有追踪钱包
  const clearAllWallets = () => {
    if (confirm('确定要清除所有追踪的钱包吗？此操作不可撤销。')) {
      setTrackedWallets([])
      localStorage.removeItem('trackedWallets')
    }
  }

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">低风险</span>
      case 'medium':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">中等风险</span>
      case 'high':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">高风险</span>
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">未知</span>
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          钱包追踪
        </h1>
        <p className="text-gray-600">
          监控和管理您关注的区块链钱包地址
        </p>
      </div>

      {/* Add Wallet */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">添加钱包地址</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="输入钱包地址 (0x...)"
            value={newWallet}
            onChange={(e) => setNewWallet(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            onClick={addWallet}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '添加中...' : '添加追踪'}
          </button>
          {trackedWallets.length > 0 && (
            <>
              <button 
                onClick={refreshWallets}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '刷新中...' : '刷新数据'}
              </button>
              <button 
                onClick={clearAllWallets}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                清除全部
              </button>
            </>
          )}
        </div>
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">追踪钱包</h3>
          <p className="text-3xl font-bold text-blue-600">{trackedWallets.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">总余额</h3>
          <p className="text-3xl font-bold text-green-600">
            {trackedWallets.reduce((sum, wallet) => {
              const balance = parseFloat(wallet.balance.replace(' ETH', ''))
              return sum + balance
            }, 0).toFixed(4)} ETH
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">总交易数</h3>
          <p className="text-3xl font-bold text-purple-600">
            {trackedWallets.reduce((sum, wallet) => sum + wallet.transactionCount, 0)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">高风险钱包</h3>
          <p className="text-3xl font-bold text-red-600">
            {trackedWallets.filter(wallet => wallet.riskLevel === 'high').length}
          </p>
        </div>
      </div>

      {/* Wallet List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">追踪的钱包列表</h3>
        </div>
        {trackedWallets.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <p className="text-gray-500 mb-2">暂无追踪的钱包</p>
              <p className="text-sm text-gray-400">添加钱包地址开始监控</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    钱包名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    地址
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    余额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    风险等级
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    交易数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最后活动
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trackedWallets.map((wallet, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{wallet.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{wallet.balance}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRiskBadge(wallet.riskLevel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{wallet.transactionCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{wallet.lastActivity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => removeWallet(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        移除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
        {trackedWallets.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center">
              <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-2">暂无追踪的钱包</p>
              <p className="text-sm text-gray-400">添加钱包地址后，这里将显示最近的活动</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {trackedWallets.slice(0, 5).map((wallet, index) => {
              const timeAgo = wallet.lastActivity === '无活动' ? '无活动' : wallet.lastActivity
              const isActive = wallet.lastActivity !== '无活动' && wallet.lastActivity !== '获取失败'
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      wallet.riskLevel === 'high' ? 'bg-red-500' :
                      wallet.riskLevel === 'medium' ? 'bg-yellow-500' :
                      wallet.riskLevel === 'low' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {wallet.name} {isActive ? '有活动' : '无活动'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {wallet.balance} • {wallet.transactionCount} 笔交易 • {timeAgo}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    wallet.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                    wallet.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    wallet.riskLevel === 'low' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {wallet.riskLevel === 'high' ? '高风险' :
                     wallet.riskLevel === 'medium' ? '中等风险' :
                     wallet.riskLevel === 'low' ? '低风险' : '未知'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletTracking
