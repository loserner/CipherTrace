import React, { useState, useEffect } from 'react'
import { useWalletData } from '../hooks/useWalletData'
import { blockchainService } from '../services/blockchain'

// 扩展 Window 接口以包含 ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

const TransactionAnalysis = () => {
  const [searchAddress, setSearchAddress] = useState('')
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string | null>(null)
  const [analyzedAddress, setAnalyzedAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 使用当前连接的钱包数据
  const { transactions: currentWalletTransactions, stats: currentWalletStats } = useWalletData(currentWalletAddress)
  
  // 分析目标地址的数据
  const { transactions: analyzedTransactions, stats: analyzedStats } = useWalletData(analyzedAddress)

  // 检查当前连接的钱包
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          })
          
          if (accounts.length > 0) {
            setCurrentWalletAddress(accounts[0])
          }
        } catch (error) {
          console.error('检查钱包连接状态失败:', error)
        }
      }
    }

    checkWalletConnection()

    // 监听账户变化
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setCurrentWalletAddress(accounts[0])
        } else {
          setCurrentWalletAddress(null)
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  // 搜索地址功能
  const handleSearch = async () => {
    if (!searchAddress.trim()) {
      setError('请输入有效的钱包地址')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // 验证地址格式
      if (!searchAddress.startsWith('0x') || searchAddress.length !== 42) {
        throw new Error('无效的钱包地址格式')
      }
      
      setAnalyzedAddress(searchAddress)
    } catch (err: any) {
      setError(err.message || '搜索失败')
    } finally {
      setLoading(false)
    }
  }

  // 分析当前连接的钱包
  const analyzeCurrentWallet = () => {
    if (currentWalletAddress) {
      setAnalyzedAddress(currentWalletAddress)
      setSearchAddress(currentWalletAddress)
    }
  }

  // 计算风险指标
  const calculateRiskMetrics = (transactions: any[], stats: any) => {
    if (!transactions || transactions.length === 0) {
      return {
        riskScore: '低',
        riskColor: 'text-green-600',
        suspiciousActivities: 0,
        abnormalPatterns: 0,
        relatedAddresses: 0
      }
    }

    // 使用与风险评估页面一致的逻辑
    const riskTransactions = transactions.filter(tx => 
      parseFloat(tx.value) > 10 || tx.status === 'failed'
    ).length

    const totalTransactions = transactions.length
    const riskPercentage = (riskTransactions / totalTransactions) * 100

    let riskScore = '低'
    let riskColor = 'text-green-600'
    
    if (riskPercentage > 20) {
      riskScore = '高'
      riskColor = 'text-red-600'
    } else if (riskPercentage > 10) {
      riskScore = '中等'
      riskColor = 'text-yellow-600'
    }

    // 计算关联地址数量
    const uniqueAddresses = new Set([
      ...transactions.map(tx => tx.from),
      ...transactions.map(tx => tx.to)
    ]).size

    // 计算时间模式异常（与风险评估页面一致）
    const dailyTransactionCounts = new Map()
    const dailyHourlyTransactions = new Map()
    let timePatterns = 0

    transactions.forEach(tx => {
      // tx.timestamp 已经是毫秒时间戳，不需要再乘以1000
      const timestamp = tx.timestamp
      const date = new Date(timestamp)
      const dateStr = date.toLocaleDateString('zh-CN')
      const hour = date.getHours()
      const key = `${dateStr}-${hour}`
      
      dailyTransactionCounts.set(dateStr, (dailyTransactionCounts.get(dateStr) || 0) + 1)
      dailyHourlyTransactions.set(key, (dailyHourlyTransactions.get(key) || 0) + 1)
    })

    // 分析时间模式
    console.log('📅 每日交易统计:', Object.fromEntries(dailyTransactionCounts))
    for (const [date, count] of dailyTransactionCounts) {
      if (count > 20) {
        timePatterns++
        console.log(`⚠️ 日期 ${date} 交易过于频繁: ${count} 笔`)
      }
    }
    
    console.log('⏰ 每小时交易统计:', Object.fromEntries(dailyHourlyTransactions))
    for (const [key, count] of dailyHourlyTransactions) {
      if (count > 5) {
        timePatterns++
        console.log(`⚠️ 时间 ${key} 交易过于集中: ${count} 笔`)
      }
    }

    console.log('🔍 交易分析风险指标计算:', {
      totalTransactions,
      riskTransactions,
      riskPercentage,
      timePatterns,
      uniqueAddresses
    })

    return {
      riskScore,
      riskColor,
      suspiciousActivities: riskTransactions,
      abnormalPatterns: timePatterns,
      relatedAddresses: uniqueAddresses
    }
  }

  // 获取当前显示的数据
  const displayTransactions = analyzedAddress ? analyzedTransactions : currentWalletTransactions
  const displayStats = analyzedAddress ? analyzedStats : currentWalletStats
  const riskMetrics = calculateRiskMetrics(displayTransactions, displayStats)

  // 调试日志
  console.log('🔍 交易分析页面数据:', {
    analyzedAddress,
    currentWalletAddress,
    displayTransactionsCount: displayTransactions?.length || 0,
    displayStats,
    riskMetrics
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          交易分析
        </h1>
        <p className="text-gray-600">
          分析特定地址的交易模式和风险指标
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">地址分析</h2>
        
        {currentWalletAddress && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">
                  <strong>当前连接钱包:</strong> {currentWalletAddress.slice(0, 6)}...{currentWalletAddress.slice(-4)}
                </p>
              </div>
              <button
                onClick={analyzeCurrentWallet}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                分析当前钱包
              </button>
            </div>
          </div>
        )}
        
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="输入钱包地址 (0x...)"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '分析中...' : '分析地址'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {analyzedAddress && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>正在分析:</strong> {analyzedAddress.slice(0, 6)}...{analyzedAddress.slice(-4)}
            </p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">交易统计</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">总交易数</span>
              <span className="font-semibold">{displayStats?.totalTransactions || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">发送交易</span>
              <span className="font-semibold">
                {displayTransactions ? displayTransactions.filter(tx => 
                  tx.from.toLowerCase() === (analyzedAddress || currentWalletAddress)?.toLowerCase()
                ).length : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">接收交易</span>
              <span className="font-semibold">
                {displayTransactions ? displayTransactions.filter(tx => 
                  tx.to.toLowerCase() === (analyzedAddress || currentWalletAddress)?.toLowerCase()
                ).length : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">总价值</span>
              <span className="font-semibold">
                {displayTransactions ? 
                  displayTransactions.reduce((sum, tx) => sum + parseFloat(tx.value), 0).toFixed(4) : 
                  '0.0000'
                } ETH
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">风险指标</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">风险评分</span>
              <span className={`font-semibold ${riskMetrics.riskColor}`}>
                {riskMetrics.riskScore}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">可疑活动</span>
              <span className="font-semibold text-red-600">
                {riskMetrics.suspiciousActivities}次
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">异常模式</span>
              <span className="font-semibold text-orange-600">
                {riskMetrics.abnormalPatterns}个
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">关联地址</span>
              <span className="font-semibold">
                {riskMetrics.relatedAddresses}个
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近交易</h3>
        
        {!displayTransactions || displayTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center">
              <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-2">暂无交易记录</p>
              <p className="text-sm text-gray-400">
                {analyzedAddress ? '该地址没有交易记录' : '请连接钱包或搜索地址进行分析'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    交易哈希
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayTransactions.slice(0, 10).map((tx) => {
                  const targetAddress = analyzedAddress || currentWalletAddress
                  const isIncoming = tx.to.toLowerCase() === targetAddress?.toLowerCase()
                  const timeAgo = new Date(tx.timestamp).toLocaleString('zh-CN')
                  
                  return (
                    <tr key={tx.hash}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isIncoming 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isIncoming ? '接收' : '发送'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={isIncoming ? 'text-green-600' : 'text-red-600'}>
                          {isIncoming ? '+' : '-'}{parseFloat(tx.value).toFixed(4)} ETH
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {timeAgo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tx.status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.status === 'success' ? '成功' : '失败'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionAnalysis