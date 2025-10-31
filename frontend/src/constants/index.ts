// 应用常量配置

export const APP_CONFIG = {
  name: '交易分析 DApp',
  version: '1.0.0',
  description: '基于FHEVM的去中心化交易分析平台',
  author: 'Transaction Analysis Team',
  website: 'https://transaction-analysis-dapp.com'
}

// 网络配置
export const NETWORKS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SepoliaETH',
      decimals: 18
    }
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-mainnet.infura.io/v3/',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  bsc: {
    chainId: 56,
    name: 'BSC',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  }
}

// 风险等级配置
export const RISK_LEVELS = {
  low: {
    score: { min: 0, max: 40 },
    color: '#22c55e',
    label: '低风险',
    description: '交易风险较低，可以放心进行'
  },
  medium: {
    score: { min: 40, max: 70 },
    color: '#f59e0b',
    label: '中风险',
    description: '存在一定风险，建议谨慎操作'
  },
  high: {
    score: { min: 70, max: 100 },
    color: '#ef4444',
    label: '高风险',
    description: '风险较高，不建议进行此交易'
  }
}

// 交易状态配置
export const TRANSACTION_STATUS = {
  success: {
    color: '#22c55e',
    label: '成功',
    icon: '✓'
  },
  pending: {
    color: '#f59e0b',
    label: '待确认',
    icon: '⏳'
  },
  failed: {
    color: '#ef4444',
    label: '失败',
    icon: '✗'
  }
}

// 时间范围选项
export const TIME_RANGES = [
  { value: '1h', label: '1小时' },
  { value: '24h', label: '24小时' },
  { value: '7d', label: '7天' },
  { value: '30d', label: '30天' },
  { value: '90d', label: '90天' },
  { value: '1y', label: '1年' },
  { value: 'all', label: '全部' }
]

// 图表颜色配置
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
  orange: '#f97316',
  cyan: '#06b6d4',
  lime: '#84cc16',
  emerald: '#10b981',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  sky: '#0ea5e9',
  slate: '#64748b'
}

// 默认图表数据集配置
export const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false
      }
    },
    y: {
      display: true,
      grid: {
        color: '#f1f5f9'
      }
    }
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false
  }
}

// 本地存储键名
export const STORAGE_KEYS = {
  WALLET_CONNECTION: 'wallet_connection',
  USER_PREFERENCES: 'user_preferences',
  TRACKED_WALLETS: 'tracked_wallets',
  RISK_SETTINGS: 'risk_settings',
  THEME: 'theme',
  LANGUAGE: 'language'
}

// API端点
export const API_ENDPOINTS = {
  TRANSACTIONS: '/api/transactions',
  WALLETS: '/api/wallets',
  RISK: '/api/risk',
  CONTRACTS: '/api/contracts',
  ANALYTICS: '/api/analytics'
}

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查您的网络设置',
  WALLET_NOT_CONNECTED: '请先连接钱包',
  INVALID_ADDRESS: '无效的钱包地址',
  TRANSACTION_FAILED: '交易失败，请重试',
  INSUFFICIENT_BALANCE: '余额不足',
  USER_REJECTED: '用户取消了操作',
  UNKNOWN_ERROR: '发生未知错误，请重试'
}

// 成功消息
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: '钱包连接成功',
  TRANSACTION_SUCCESS: '交易成功',
  WALLET_ADDED: '钱包添加成功',
  WALLET_REMOVED: '钱包移除成功',
  SETTINGS_SAVED: '设置保存成功'
}
