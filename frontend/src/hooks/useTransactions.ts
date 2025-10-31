import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { api } from '../services/api'
import { formatAddress, formatTime, formatNumber } from '../utils/format'

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  token: string
  gasUsed: string
  gasPrice: string
  timestamp: number
  status: 'success' | 'pending' | 'failed'
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface TransactionStats {
  totalTransactions: number
  totalVolume: string
  averageGasPrice: string
  riskTransactions: number
  successRate: number
}

export function useTransactions(address?: string) {
  const { address: connectedAddress } = useAccount()
  const targetAddress = address || connectedAddress
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async (page = 1, limit = 20) => {
    if (!targetAddress) return

    setLoading(true)
    setError(null)

    try {
      const [transactionsData, statsData] = await Promise.all([
        api.transaction.getTransactions(targetAddress, page, limit),
        api.transaction.getTransactionStats(targetAddress)
      ])

      setTransactions(transactionsData.transactions || [])
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取交易数据失败')
      console.error('Failed to fetch transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const analyzeTransaction = async (txHash: string) => {
    try {
      const result = await api.transaction.analyzeTransaction(txHash)
      return result
    } catch (err) {
      console.error('Failed to analyze transaction:', err)
      throw err
    }
  }

  const refreshTransactions = () => {
    fetchTransactions()
  }

  useEffect(() => {
    if (targetAddress) {
      fetchTransactions()
    }
  }, [targetAddress])

  return {
    transactions,
    stats,
    loading,
    error,
    fetchTransactions,
    analyzeTransaction,
    refreshTransactions
  }
}

export function useTransactionAnalysis(txHash: string) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalysis = async () => {
    if (!txHash) return

    setLoading(true)
    setError(null)

    try {
      const result = await api.transaction.analyzeTransaction(txHash)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析交易失败')
      console.error('Failed to fetch transaction analysis:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (txHash) {
      fetchAnalysis()
    }
  }, [txHash])

  return {
    analysis,
    loading,
    error,
    refetch: fetchAnalysis
  }
}
