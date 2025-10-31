/**
 * API服务 - 处理与后端和区块链的交互
 */

// 基础API配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const THE_GRAPH_URL = import.meta.env.VITE_THE_GRAPH_API_URL || 'https://api.thegraph.com/subgraphs/name/your-subgraph'

// 请求拦截器
const request = async (url: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// 交易相关API
export const transactionAPI = {
  // 获取交易历史
  getTransactions: async (address: string, page = 1, limit = 20) => {
    const res = await request(`${API_BASE_URL}/api/transactions?address=${address}&page=${page}&limit=${limit}`)
    return res?.data ?? res
  },

  // 获取交易详情
  getTransaction: async (txHash: string) => {
    return request(`${API_BASE_URL}/api/transactions/${txHash}`)
  },

  // 分析交易风险
  analyzeTransaction: async (txHash: string) => {
    return request(`${API_BASE_URL}/api/transactions/${txHash}/analyze`, {
      method: 'POST'
    })
  },

  // 获取用户交易统计
  getTransactionStats: async (address: string) => {
    const res = await request(`${API_BASE_URL}/api/transactions/stats/${address}`)
    return res?.data ?? res
  }
}

// 钱包相关API
export const walletAPI = {
  // 获取钱包信息
  getWalletInfo: async (address: string) => {
    return request(`${API_BASE_URL}/api/wallets/${address}`)
  },

  // 添加钱包追踪
  addWalletTracking: async (address: string, label?: string) => {
    return request(`${API_BASE_URL}/api/wallets/track`, {
      method: 'POST',
      body: JSON.stringify({ address, label })
    })
  },

  // 移除钱包追踪
  removeWalletTracking: async (address: string) => {
    return request(`${API_BASE_URL}/api/wallets/track`, {
      method: 'DELETE',
      body: JSON.stringify({ address })
    })
  },

  // 获取追踪的钱包列表
  getTrackedWallets: async () => {
    return request(`${API_BASE_URL}/api/wallets/tracked`)
  }
}

// 风险评估API
export const riskAPI = {
  // 获取风险评估
  getRiskAssessment: async (address: string) => {
    return request(`${API_BASE_URL}/api/risk/assessment?address=${address}`)
  },

  // 获取风险历史
  getRiskHistory: async (address: string, days = 7) => {
    return request(`${API_BASE_URL}/api/risk/history?address=${address}&days=${days}`)
  },

  // 获取风险警报
  getRiskAlerts: async (address?: string) => {
    const url = address 
      ? `${API_BASE_URL}/api/risk/alerts?address=${address}`
      : `${API_BASE_URL}/api/risk/alerts`
    return request(url)
  }
}

// The Graph API
export const graphAPI = {
  // 查询交易数据
  queryTransactions: async (query: string) => {
    return request(THE_GRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({ query })
    })
  },

  // 获取代币信息
  getTokenInfo: async (tokenAddress: string) => {
    const query = `
      query GetTokenInfo($tokenAddress: String!) {
        token(id: $tokenAddress) {
          id
          name
          symbol
          decimals
          totalSupply
        }
      }
    `
    return request(THE_GRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({ 
        query,
        variables: { tokenAddress }
      })
    })
  },

  // 获取交易对信息
  getPairInfo: async (pairAddress: string) => {
    const query = `
      query GetPairInfo($pairAddress: String!) {
        pair(id: $pairAddress) {
          id
          token0 {
            id
            name
            symbol
            decimals
          }
          token1 {
            id
            name
            symbol
            decimals
          }
          reserve0
          reserve1
          totalSupply
        }
      }
    `
    return request(THE_GRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({ 
        query,
        variables: { pairAddress }
      })
    })
  }
}

// 智能合约交互API
export const contractAPI = {
  // 调用智能合约方法
  callContract: async (contractAddress: string, method: string, params: any[] = []) => {
    return request(`${API_BASE_URL}/api/contracts/call`, {
      method: 'POST',
      body: JSON.stringify({
        contractAddress,
        method,
        params
      })
    })
  },

  // 获取合约事件
  getContractEvents: async (contractAddress: string, eventName: string, fromBlock?: number, toBlock?: number) => {
    const params = new URLSearchParams({
      contractAddress,
      eventName,
      ...(fromBlock && { fromBlock: fromBlock.toString() }),
      ...(toBlock && { toBlock: toBlock.toString() })
    })
    
    return request(`${API_BASE_URL}/api/contracts/events?${params}`)
  }
}

// 导出所有API
export const api = {
  transaction: transactionAPI,
  wallet: walletAPI,
  risk: riskAPI,
  graph: graphAPI,
  contract: contractAPI
}
