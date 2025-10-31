/**
 * 交易量分析调试工具
 */

export const debugVolumeData = (transactions: any[], tokenBalances: any[]) => {
  console.log('🔍 交易量分析调试信息:')
  console.log('交易数据:', transactions)
  console.log('代币余额数据:', tokenBalances)
  
  if (!transactions || transactions.length === 0) {
    console.log('❌ 没有交易数据')
    return
  }

  // 分析交易数据
  let ethVolume = 0
  let totalTransactions = 0
  
  transactions.forEach((tx, index) => {
    const value = parseFloat(tx.value)
    console.log(`交易 ${index + 1}:`, {
      hash: tx.hash,
      value: tx.value,
      parsedValue: value,
      from: tx.from,
      to: tx.to,
      status: tx.status
    })
    
    if (value > 0) {
      ethVolume += value
      totalTransactions++
    }
  })

  console.log('📊 交易量统计:')
  console.log('- 总交易数:', transactions.length)
  console.log('- 有效交易数:', totalTransactions)
  console.log('- ETH交易量:', ethVolume)
  console.log('- 平均交易量:', ethVolume / totalTransactions || 0)

  // 分析代币余额
  if (tokenBalances && tokenBalances.length > 0) {
    console.log('🪙 代币余额统计:')
    tokenBalances.forEach((token, index) => {
      console.log(`代币 ${index + 1}:`, {
        symbol: token.symbol,
        balance: token.balance,
        value: token.value,
        contractAddress: token.contractAddress
      })
    })
  } else {
    console.log('❌ 没有代币余额数据')
  }

  // 生成图表数据
  const tokenStats = new Map()
  let otherVolume = 0

  transactions.forEach(tx => {
    const value = parseFloat(tx.value)
    if (value > 0) {
      ethVolume += value
    }
  })

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

  const total = data.reduce((sum, item) => sum + item.value, 0)
  console.log('📈 图表数据:', data)
  console.log('- 总交易量:', total)
  console.log('- 是否为0:', total === 0)

  return {
    ethVolume,
    totalTransactions,
    tokenStats: Object.fromEntries(tokenStats),
    chartData: data,
    total
  }
}
