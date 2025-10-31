import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { formatAddress, formatTime, formatNumber } from '../utils/format'

export interface TrackedWallet {
  id: number
  address: string
  label: string
  balance: string
  token: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  lastActivity: number
  transactionCount: number
  isWhale: boolean
}

export interface WalletActivity {
  wallet: string
  action: string
  amount: string
  to?: string
  from?: string
  timestamp: number
  riskLevel: 'low' | 'medium' | 'high'
}

export function useWalletTracking() {
  const [trackedWallets, setTrackedWallets] = useState<TrackedWallet[]>([])
  const [activities, setActivities] = useState<WalletActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrackedWallets = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await api.wallet.getTrackedWallets()
      setTrackedWallets(data.wallets || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取追踪钱包失败')
      console.error('Failed to fetch tracked wallets:', err)
    } finally {
      setLoading(false)
    }
  }

  const addWallet = async (address: string, label?: string) => {
    try {
      await api.wallet.addWalletTracking(address, label)
      await fetchTrackedWallets() // 刷新列表
    } catch (err) {
      console.error('Failed to add wallet:', err)
      throw err
    }
  }

  const removeWallet = async (address: string) => {
    try {
      await api.wallet.removeWalletTracking(address)
      await fetchTrackedWallets() // 刷新列表
    } catch (err) {
      console.error('Failed to remove wallet:', err)
      throw err
    }
  }

  const fetchWalletInfo = async (address: string) => {
    try {
      const data = await api.wallet.getWalletInfo(address)
      return data
    } catch (err) {
      console.error('Failed to fetch wallet info:', err)
      throw err
    }
  }

  const fetchActivities = async () => {
    try {
      // 这里应该调用获取钱包活动的API
      // 暂时使用模拟数据
      const mockActivities: WalletActivity[] = [
        {
          wallet: '0x1234...5678',
          action: '发送',
          amount: '1.5 ETH',
          to: '0xabcd...efgh',
          timestamp: Date.now() - 1800000,
          riskLevel: 'low'
        },
        {
          wallet: '0x2345...7890',
          action: '接收',
          amount: '0.3 ETH',
          from: '0xijkl...mnop',
          timestamp: Date.now() - 3600000,
          riskLevel: 'medium'
        }
      ]
      setActivities(mockActivities)
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    }
  }

  useEffect(() => {
    fetchTrackedWallets()
    fetchActivities()
  }, [])

  return {
    trackedWallets,
    activities,
    loading,
    error,
    addWallet,
    removeWallet,
    fetchWalletInfo,
    refreshWallets: fetchTrackedWallets,
    refreshActivities: fetchActivities
  }
}
