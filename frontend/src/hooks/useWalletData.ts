import { useState, useEffect } from 'react'
import { blockchainService, Transaction, WalletStats, TokenBalance } from '../services/blockchain'

interface UseWalletDataReturn {
  transactions: Transaction[]
  stats: WalletStats | null
  tokenBalances: TokenBalance[]
  ethBalance: string
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useWalletData = (address: string | null): UseWalletDataReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<WalletStats | null>(null)
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [ethBalance, setEthBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWalletData = async () => {
    console.log('🔄 fetchWalletData 被调用，地址:', address)
    
    if (!address) {
      console.log('❌ 没有地址，重置所有数据')
      setTransactions([])
      setStats(null)
      setTokenBalances([])
      setEthBalance('0')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 等待网络检测完成，并确保blockchainService已正确配置
      let retries = 0
      while (retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 检查blockchainService是否已正确配置
        if (blockchainService['currentChainId'] && blockchainService['currentChainId'] !== 1) {
          break
        }
        
        retries++
        console.log(`等待网络配置完成... (${retries}/10)`)
      }
      
      console.log('🔍 开始获取钱包数据:', {
        address,
        currentChainId: blockchainService['currentChainId'],
        apiKey: !!import.meta.env.VITE_ETHERSCAN_API_KEY,
        apiKeyValue: import.meta.env.VITE_ETHERSCAN_API_KEY?.substring(0, 8) + '...',
        retries
      })

      // 并行获取所有数据，但分别处理每个请求的错误
      const results = await Promise.allSettled([
        blockchainService.getWalletTransactions(address, 100), // 获取更多交易用于风险评估
        blockchainService.getWalletStats(address),
        blockchainService.getTokenBalances(address),
        blockchainService.getETHBalance(address)
      ])

      // 处理每个结果
      const [transactionsResult, statsResult, tokenBalancesResult, ethBalanceResult] = results

      // 处理交易数据
      if (transactionsResult.status === 'fulfilled') {
        setTransactions(transactionsResult.value)
        console.log('✅ 交易数据获取成功:', transactionsResult.value.length, '笔')
      } else {
        console.error('❌ 交易数据获取失败:', transactionsResult.reason)
        setTransactions([])
      }

      // 处理统计数据
      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value)
        console.log('✅ 统计数据获取成功:', statsResult.value)
      } else {
        console.error('❌ 统计数据获取失败:', statsResult.reason)
        setStats({
          totalTransactions: 0,
          totalValue: '0',
          riskTransactions: 0,
          activeWallets: 0
        })
      }

      // 处理代币余额数据
      if (tokenBalancesResult.status === 'fulfilled') {
        setTokenBalances(tokenBalancesResult.value)
        console.log('✅ 代币余额获取成功:', tokenBalancesResult.value.length, '种')
      } else {
        console.error('❌ 代币余额获取失败:', tokenBalancesResult.reason)
        setTokenBalances([])
      }

      // 处理ETH余额数据
      if (ethBalanceResult.status === 'fulfilled') {
        setEthBalance(ethBalanceResult.value)
        console.log('✅ ETH余额获取成功:', ethBalanceResult.value)
      } else {
        console.error('❌ ETH余额获取失败:', ethBalanceResult.reason)
        setEthBalance('0')
      }

      console.log('📊 钱包数据获取完成')
    } catch (err) {
      console.error('获取钱包数据失败:', err)
      setError('获取钱包数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [address])

  return {
    transactions,
    stats,
    tokenBalances,
    ethBalance,
    loading,
    error,
    refetch: fetchWalletData
  }
}
