// 通用类型定义

export interface BaseEntity {
  id: string | number
  createdAt: number
  updatedAt: number
}

// 钱包相关类型
export interface Wallet extends BaseEntity {
  address: string
  label?: string
  balance: string
  token: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  lastActivity: number
  transactionCount: number
  isWhale: boolean
  isTracked: boolean
}

// 交易相关类型
export interface Transaction extends BaseEntity {
  hash: string
  from: string
  to: string
  value: string
  token: string
  gasUsed: string
  gasPrice: string
  timestamp: number
  blockNumber: number
  status: 'success' | 'pending' | 'failed'
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
  isContractCreation?: boolean
}

// 风险评估类型
export interface RiskFactor {
  name: string
  score: number
  status: 'good' | 'warning' | 'danger'
  description: string
  weight: number
}

export interface RiskAssessment extends BaseEntity {
  address: string
  overallScore: number
  riskFactors: RiskFactor[]
  recentAlerts: RiskAlert[]
  trend: RiskTrend
  lastUpdated: number
}

export interface RiskAlert extends BaseEntity {
  type: 'warning' | 'info' | 'danger'
  message: string
  timestamp: number
  severity: 'low' | 'medium' | 'high'
  address?: string
  transactionHash?: string
  isRead: boolean
}

export interface RiskTrend {
  current: number
  previous: number
  weeklyAverage: number
  monthlyAverage: number
  change: number
  changePercent: number
}

// 图表数据类型
export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
  tension?: number
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: string
  pagination?: Pagination
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// 统计数据类型
export interface TransactionStats {
  totalTransactions: number
  totalVolume: string
  averageGasPrice: string
  riskTransactions: number
  successRate: number
  dailyStats: DailyStats[]
}

export interface DailyStats {
  date: string
  transactions: number
  volume: string
  riskScore: number
}

// 钱包活动类型
export interface WalletActivity extends BaseEntity {
  wallet: string
  action: 'send' | 'receive' | 'swap' | 'approve' | 'contract_interaction'
  amount: string
  token: string
  to?: string
  from?: string
  transactionHash: string
  timestamp: number
  riskLevel: 'low' | 'medium' | 'high'
  gasUsed: string
  gasPrice: string
}

// 代币类型
export interface Token {
  address: string
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  price?: string
  priceChange24h?: number
  volume24h?: string
  marketCap?: string
}

// 交易对类型
export interface TradingPair {
  address: string
  token0: Token
  token1: Token
  reserve0: string
  reserve1: string
  totalSupply: string
  price0?: string
  price1?: string
  volume24h?: string
  liquidity?: string
}

// 用户设置类型
export interface UserSettings {
  notifications: NotificationSettings
  privacy: PrivacySettings
  display: DisplaySettings
  security: SecuritySettings
}

export interface NotificationSettings {
  riskAlerts: boolean
  largeTransactions: boolean
  whaleActivity: boolean
  priceAlerts: boolean
  email: boolean
  push: boolean
}

export interface PrivacySettings {
  dataSharing: boolean
  analytics: boolean
  crashReporting: boolean
  anonymousMode: boolean
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  currency: string
  timezone: string
  dateFormat: string
}

export interface SecuritySettings {
  autoLock: boolean
  lockTimeout: number
  requirePassword: boolean
  twoFactorAuth: boolean
}

// 网络类型
export interface Network {
  chainId: number
  name: string
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

// 错误类型
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: number
}

// 加载状态类型
export interface LoadingState {
  isLoading: boolean
  error: string | null
  lastUpdated?: number
}

// 分页查询参数
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 时间范围查询参数
export interface TimeRangeParams {
  startTime?: number
  endTime?: number
  range?: '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all'
}

// 搜索参数
export interface SearchParams extends PaginationParams, TimeRangeParams {
  query?: string
  address?: string
  riskLevel?: 'low' | 'medium' | 'high'
  status?: 'success' | 'pending' | 'failed'
}
