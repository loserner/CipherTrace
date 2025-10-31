import React, { useState, useEffect } from 'react'
import RiskScoreChart from '../components/charts/RiskScoreChart'
import { useWalletData } from '../hooks/useWalletData'

// 扩展 Window 接口以包含 ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

const RiskAssessment = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const { transactions, stats, loading, error, refetch } = useWalletData(walletAddress)

  // 检查当前连接的钱包
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          })
          
          if (accounts.length > 0) {
            setWalletAddress(accounts[0])
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
          setWalletAddress(accounts[0])
        } else {
          setWalletAddress(null)
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  // 计算风险分析数据
  const calculateRiskAnalysis = () => {
    console.log('🔍 风险评估 - 交易数据:', {
      transactionCount: transactions?.length || 0,
      transactions: transactions?.slice(0, 3) || []
    })
    
    if (!transactions || transactions.length === 0) {
      console.log('❌ 风险评估 - 没有交易数据')
      return {
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        riskFactors: {
          largeTransfers: 0,
          frequentSmall: 0,
          suspiciousAddresses: 0,
          timePatterns: 0
        },
        riskAlerts: []
      }
    }

    let highRisk = 0
    let mediumRisk = 0
    let lowRisk = 0
    let largeTransfers = 0
    let frequentSmall = 0
    let suspiciousAddresses = 0
    let timePatterns = 0

    // 分析每笔交易
    transactions.forEach(tx => {
      const value = parseFloat(tx.value)
      const isFailed = tx.status === 'failed'
      
      // 风险等级分类
      if (isFailed || value > 10) {
        highRisk++
      } else if (value > 1 || value < 0.001) {
        mediumRisk++
      } else {
        lowRisk++
      }

      // 风险因素分析
      if (value > 5) {
        largeTransfers++
      }
      if (value < 0.01 && value > 0) {
        frequentSmall++
      }
      // 这里可以添加更多可疑地址检测逻辑
      if (tx.from.includes('0000') || tx.to.includes('0000')) {
        suspiciousAddresses++
      }
    })

    // 时间模式分析 - 按日期和小时分析
    const dailyHourlyTransactions = new Map()
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp)
      const dateStr = date.toLocaleDateString('zh-CN')
      const hour = date.getHours()
      const key = `${dateStr}-${hour}`
      dailyHourlyTransactions.set(key, (dailyHourlyTransactions.get(key) || 0) + 1)
    })
    
    // 分析异常时间模式
    const dailyTransactionCounts = new Map()
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp)
      const dateStr = date.toLocaleDateString('zh-CN')
      dailyTransactionCounts.set(dateStr, (dailyTransactionCounts.get(dateStr) || 0) + 1)
    })
    
    // 检测异常模式：
    // 1. 某天交易过于频繁
    // 2. 某个时间段（小时）交易过于集中
    for (const [date, count] of dailyTransactionCounts) {
      if (count > 20) { // 某天交易超过20笔
        timePatterns++
      }
    }
    
    for (const [key, count] of dailyHourlyTransactions) {
      if (count > 5) { // 某个小时交易超过5笔
        timePatterns++
      }
    }

    // 生成风险预警
    const riskAlerts = []
    if (largeTransfers > 0) {
      const latestLarge = transactions.find(tx => parseFloat(tx.value) > 5)
      if (latestLarge) {
        riskAlerts.push({
          type: 'high',
          title: '检测到可疑大额转账',
          description: `地址 ${latestLarge.from.slice(0, 6)}...${latestLarge.from.slice(-4)} 向 ${latestLarge.to.slice(0, 6)}...${latestLarge.to.slice(-4)} 转账 ${parseFloat(latestLarge.value).toFixed(4)} ETH`,
          time: new Date(latestLarge.timestamp).toLocaleString('zh-CN')
        })
      }
    }

    if (frequentSmall > 5) {
      riskAlerts.push({
        type: 'medium',
        title: '频繁小额交易模式检测',
        description: `检测到 ${frequentSmall} 笔小额交易，可能存在异常行为`,
        time: new Date().toLocaleString('zh-CN')
      })
    }

    if (suspiciousAddresses > 0) {
      riskAlerts.push({
        type: 'medium',
        title: '可疑地址关联',
        description: `检测到 ${suspiciousAddresses} 笔与可疑地址的关联交易`,
        time: new Date().toLocaleString('zh-CN')
      })
    }

    const result = {
      highRisk,
      mediumRisk,
      lowRisk,
      riskFactors: {
        largeTransfers,
        frequentSmall,
        suspiciousAddresses,
        timePatterns
      },
      riskAlerts
    }
    
    console.log('✅ 风险评估计算结果:', result)
    return result
  }

  const riskAnalysis = calculateRiskAnalysis()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          风险评估
        </h1>
        <p className="text-gray-600">
          基于机器学习的交易风险分析和预警系统
        </p>
        {walletAddress ? (
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500">
              分析钱包: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <button
              onClick={refetch}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '刷新中...' : '刷新数据'}
            </button>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  请先连接您的钱包以进行风险评估分析
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">高风险交易</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-red-600">{riskAnalysis.highRisk}</p>
              <p className="text-sm text-gray-500 mt-1">需要立即关注</p>
            </>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">中等风险</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-yellow-600">{riskAnalysis.mediumRisk}</p>
              <p className="text-sm text-gray-500 mt-1">建议监控</p>
            </>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">低风险</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-green-600">{riskAnalysis.lowRisk}</p>
              <p className="text-sm text-gray-500 mt-1">正常交易</p>
            </>
          )}
        </div>
      </div>

      {/* Risk Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">风险趋势分析</h3>
        <RiskScoreChart walletAddress={walletAddress} />
      </div>

      {/* Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">主要风险因素</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">大额异常转账</span>
              <span className="text-red-600 font-semibold">{riskAnalysis.riskFactors.largeTransfers}次</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">频繁小额交易</span>
              <span className="text-yellow-600 font-semibold">{riskAnalysis.riskFactors.frequentSmall}次</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-gray-700">可疑地址交互</span>
              <span className="text-orange-600 font-semibold">{riskAnalysis.riskFactors.suspiciousAddresses}次</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">时间模式异常</span>
              <span className="text-purple-600 font-semibold">{riskAnalysis.riskFactors.timePatterns}次</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">风险预警</h3>
          <div className="space-y-3">
            {riskAnalysis.riskAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center">
                  <svg className="h-12 w-12 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 mb-2">暂无风险预警</p>
                  <p className="text-sm text-gray-400">当前交易模式正常</p>
                </div>
              </div>
            ) : (
              riskAnalysis.riskAlerts.map((alert, index) => (
                <div key={index} className={`p-4 border-l-4 ${
                  alert.type === 'high' 
                    ? 'bg-red-50 border-red-500' 
                    : 'bg-yellow-50 border-yellow-500'
                }`}>
                  <div className="flex">
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        alert.type === 'high' ? 'text-red-800' : 'text-yellow-800'
                      }`}>
                        {alert.title}
                      </p>
                      <p className={`text-sm mt-1 ${
                        alert.type === 'high' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {alert.description}
                      </p>
                      <p className={`text-xs mt-1 ${
                        alert.type === 'high' ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {alert.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Risk Mitigation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">风险缓解建议</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">立即行动</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 暂停高风险地址的交易权限</li>
              <li>• 增加交易确认步骤</li>
              <li>• 设置更严格的交易限额</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">长期策略</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 实施更智能的风险检测算法</li>
              <li>• 建立用户行为基线模型</li>
              <li>• 加强与其他安全平台的合作</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskAssessment