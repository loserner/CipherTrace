import React, { useEffect } from 'react'
import { useWalletData } from '../../hooks/useWalletData'
import { debugVolumeData } from '../../utils/debugVolume'

interface VolumeChartProps {
  walletAddress: string | null
}

const VolumeChart = ({ walletAddress }: VolumeChartProps) => {
  const { transactions, tokenBalances, loading, error } = useWalletData(walletAddress)

  // 调试交易量数据
  useEffect(() => {
    if (walletAddress && !loading) {
      console.log('🔍 VolumeChart 调试信息:')
      console.log('- 钱包地址:', walletAddress)
      console.log('- 加载状态:', loading)
      console.log('- 错误信息:', error)
      console.log('- 交易数据长度:', transactions?.length || 0)
      console.log('- 代币余额长度:', tokenBalances?.length || 0)
      
      if (transactions && transactions.length > 0) {
        debugVolumeData(transactions, tokenBalances || [])
      }
    }
  }, [walletAddress, transactions, tokenBalances, loading, error])

  // 根据真实数据生成图表数据
  const generateChartData = () => {
    if (!transactions || transactions.length === 0) {
      return [
        { name: 'ETH', value: 0, color: 'bg-blue-500' },
        { name: 'USDT', value: 0, color: 'bg-green-500' },
        { name: 'USDC', value: 0, color: 'bg-purple-500' },
        { name: '其他', value: 0, color: 'bg-gray-500' },
      ]
    }

    // 统计交易中的代币类型
    const tokenStats = new Map()
    let ethVolume = 0
    let otherVolume = 0

    transactions.forEach(tx => {
      const value = parseFloat(tx.value)
      if (value > 0) {
        ethVolume += value
      }
    })

    // 如果有代币余额数据，也加入统计
    tokenBalances.forEach(token => {
      const balance = parseFloat(token.balance)
      if (balance > 0) {
        tokenStats.set(token.symbol, (tokenStats.get(token.symbol) || 0) + balance)
      }
    })

    const data = [
      { name: 'ETH', value: Math.min(ethVolume, 100), color: 'bg-blue-500' },
      { name: 'USDT', value: Math.min(tokenStats.get('USDT') || 0, 100), color: 'bg-green-500' },
      { name: 'USDC', value: Math.min(tokenStats.get('USDC') || 0, 100), color: 'bg-purple-500' },
      { name: '其他', value: Math.min(otherVolume, 100), color: 'bg-gray-500' },
    ]

    // 转换为百分比
    const total = data.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) {
      return data.map(item => ({ ...item, value: 0 }))
    }

    return data.map(item => ({
      ...item,
      value: Math.round((item.value / total) * 100)
    }))
  }

  const data = generateChartData()
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // 显示加载状态
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">加载交易数据中...</p>
        </div>
      </div>
    )
  }

  // 显示错误状态
  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-red-600">加载失败</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <div className="flex items-center justify-center h-full">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const circumference = 2 * Math.PI * 45
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
              const strokeDashoffset = -((data.slice(0, index).reduce((sum, d) => sum + d.value, 0) / total) * circumference)
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className={`text-${item.color.split('-')[1]}-500`}
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}%</div>
              <div className="text-sm text-gray-500">总交易量</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
            <span className="text-sm text-gray-600">{item.name}</span>
            <span className="text-sm font-medium text-gray-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VolumeChart