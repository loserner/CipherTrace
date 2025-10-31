import React from 'react'
import { useWalletData } from '../../hooks/useWalletData'

interface RiskScoreChartProps {
  walletAddress: string | null
}

const RiskScoreChart = ({ walletAddress }: RiskScoreChartProps) => {
  const { transactions } = useWalletData(walletAddress)

  // 根据真实交易数据计算风险分布
  const generateRiskData = () => {
    console.log('🔍 RiskScoreChart - 交易数据:', {
      transactionCount: transactions?.length || 0,
      transactions: transactions?.slice(0, 3) || []
    })
    
    if (!transactions || transactions.length === 0) {
      console.log('❌ RiskScoreChart - 没有交易数据')
      return [
        { score: 85, label: '高风险', count: 0, color: 'bg-red-500' },
        { score: 65, label: '中风险', count: 0, color: 'bg-yellow-500' },
        { score: 25, label: '低风险', count: 0, color: 'bg-green-500' },
      ]
    }

    let highRisk = 0
    let mediumRisk = 0
    let lowRisk = 0

    transactions.forEach(tx => {
      const value = parseFloat(tx.value)
      const isFailed = tx.status === 'failed'
      
      // 风险评分逻辑
      if (isFailed || value > 10) {
        highRisk++
      } else if (value > 1 || value < 0.001) {
        mediumRisk++
      } else {
        lowRisk++
      }
    })

    const result = [
      { score: 85, label: '高风险', count: highRisk, color: 'bg-red-500' },
      { score: 65, label: '中风险', count: mediumRisk, color: 'bg-yellow-500' },
      { score: 25, label: '低风险', count: lowRisk, color: 'bg-green-500' },
    ]
    
    console.log('✅ RiskScoreChart 计算结果:', result)
    return result
  }

  const data = generateRiskData()
  const maxCount = Math.max(...data.map(d => d.count), 1) // 避免除零

  return (
    <div className="h-64">
      <div className="flex items-end justify-between h-full space-x-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={`w-full ${item.color} rounded-t`}
              style={{ height: `${(item.count / maxCount) * 200}px` }}
            ></div>
            <div className="text-xs text-gray-500 mt-2">{item.label}</div>
            <div className="text-xs font-medium text-gray-700">{item.count}</div>
            <div className="text-xs text-gray-500">评分: {item.score}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RiskScoreChart