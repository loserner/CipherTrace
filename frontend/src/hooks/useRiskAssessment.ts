import { useState, useEffect } from 'react'
import { api } from '../services/api'

export interface RiskFactor {
  name: string
  score: number
  status: 'good' | 'warning' | 'danger'
  description: string
}

export interface RiskAssessment {
  overallScore: number
  riskFactors: RiskFactor[]
  recentAlerts: RiskAlert[]
  trend: {
    current: number
    previous: number
    weeklyAverage: number
  }
}

export interface RiskAlert {
  type: 'warning' | 'info' | 'danger'
  message: string
  timestamp: number
  severity: 'low' | 'medium' | 'high'
}

export function useRiskAssessment(address?: string) {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAssessment = async () => {
    if (!address) return

    setLoading(true)
    setError(null)

    try {
      const data = await api.risk.getRiskAssessment(address)
      setAssessment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取风险评估失败')
      console.error('Failed to fetch risk assessment:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRiskHistory = async (days = 7) => {
    if (!address) return

    try {
      const data = await api.risk.getRiskHistory(address, days)
      return data
    } catch (err) {
      console.error('Failed to fetch risk history:', err)
      throw err
    }
  }

  const fetchRiskAlerts = async () => {
    try {
      const data = await api.risk.getRiskAlerts(address)
      return data
    } catch (err) {
      console.error('Failed to fetch risk alerts:', err)
      throw err
    }
  }

  useEffect(() => {
    if (address) {
      fetchAssessment()
    }
  }, [address])

  return {
    assessment,
    loading,
    error,
    fetchAssessment,
    fetchRiskHistory,
    fetchRiskAlerts,
    refetch: fetchAssessment
  }
}

export function useRiskAlerts() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = async (address?: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await api.risk.getRiskAlerts(address)
      setAlerts(data.alerts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取风险警报失败')
      console.error('Failed to fetch risk alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    refetch: fetchAlerts
  }
}
