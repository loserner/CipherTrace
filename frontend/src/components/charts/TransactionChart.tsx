import React from 'react'
import { useWalletData } from '../../hooks/useWalletData'

interface TransactionChartProps {
  walletAddress: string | null
}

const TransactionChart = ({ walletAddress }: TransactionChartProps) => {
  const { transactions } = useWalletData(walletAddress)

  // 根据真实交易数据生成图表数据
  const generateChartData = () => {
    if (!transactions || transactions.length === 0) {
      // 生成最近7天的默认数据
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        last7Days.push({
          date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          value: 0
        })
      }
      return last7Days
    }

    // 按日期分组统计交易数量
    const dailyData = new Map()
    
    // 获取交易的时间范围
    const dates = transactions.map(tx => new Date(tx.timestamp))
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
    
    // 生成日期范围
    const dateRange = []
    const currentDate = new Date(minDate)
    while (currentDate <= maxDate) {
      const dateStr = currentDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      dailyData.set(dateStr, 0)
      dateRange.push(dateStr)
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // 如果数据不足7天，补充最近7天
    if (dateRange.length < 7) {
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
        if (!dailyData.has(dateStr)) {
          dailyData.set(dateStr, 0)
          last7Days.push(dateStr)
        }
      }
      // 合并并排序
      const allDates = [...new Set([...dateRange, ...last7Days])].sort((a, b) => {
        const dateA = new Date(a.replace('月', '/').replace('日', ''))
        const dateB = new Date(b.replace('月', '/').replace('日', ''))
        return dateA.getTime() - dateB.getTime()
      })
      return allDates.slice(-7).map(date => ({
        date,
        value: dailyData.get(date) || 0
      }))
    }

    // 统计每笔交易
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp)
      const dateStr = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      dailyData.set(dateStr, (dailyData.get(dateStr) || 0) + 1)
    })

    // 返回最近7天的数据
    const sortedDates = dateRange.sort((a, b) => {
      const dateA = new Date(a.replace('月', '/').replace('日', ''))
      const dateB = new Date(b.replace('月', '/').replace('日', ''))
      return dateA.getTime() - dateB.getTime()
    })

    return sortedDates.slice(-7).map(date => ({
      date,
      value: dailyData.get(date) || 0
    }))
  }

  const data = generateChartData()
  const maxValue = Math.max(...data.map(d => d.value), 1) // 避免除零

  return (
    <div className="h-64">
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full bg-blue-500 rounded-t"
              style={{ height: `${(item.value / maxValue) * 200}px` }}
            ></div>
            <div className="text-xs text-gray-500 mt-2">{item.date}</div>
            <div className="text-xs font-medium text-gray-700">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TransactionChart