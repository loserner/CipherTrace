// 区块链数据服务
export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  blockNumber: number
  gasUsed: string
  gasPrice: string
  status: 'success' | 'failed'
  isContractCreation?: boolean
}

export interface WalletStats {
  totalTransactions: number
  totalValue: string
  riskTransactions: number
  activeWallets: number
}

export interface TokenBalance {
  symbol: string
  balance: string
  value: string
  contractAddress: string
}

class BlockchainService {
  private rpcUrl: string
  private etherscanApiKey: string
  private currentChainId: number
  private apiBaseUrl: string

  constructor() {
    // 默认使用主网配置
    this.rpcUrl = 'https://eth.llamarpc.com'
    this.etherscanApiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || ''
    this.currentChainId = 1 // 默认主网
    this.apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001'
    
    // 调试环境变量加载
    console.log('🔍 环境变量调试:', {
      hasEtherscanKey: !!this.etherscanApiKey,
      etherscanKeyLength: this.etherscanApiKey.length,
      etherscanKeyPrefix: this.etherscanApiKey.substring(0, 8) + '...',
      allViteEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
      nodeEnv: import.meta.env.MODE
    })
  }

  // 设置当前网络
  setCurrentNetwork(chainId: number) {
    console.log('🔄 设置网络配置:', {
      oldChainId: this.currentChainId,
      newChainId: chainId,
      oldRpcUrl: this.rpcUrl
    })
    
    this.currentChainId = chainId
    this.updateRpcUrl(chainId)
    
    console.log('✅ 网络配置已更新:', {
      currentChainId: this.currentChainId,
      rpcUrl: this.rpcUrl
    })
  }

  // 根据链ID更新RPC URL
  private updateRpcUrl(chainId: number) {
    switch (chainId) {
      case 1: // Ethereum Mainnet
        this.rpcUrl = 'https://eth.llamarpc.com'
        break
      case 11155111: // Sepolia Testnet
        this.rpcUrl = 'https://sepolia.infura.io/v3/2d21ac762aa444fab40c9822ba57bc61'
        break
      case 137: // Polygon Mainnet
        this.rpcUrl = 'https://polygon-mainnet.infura.io/v3/2d21ac762aa444fab40c9822ba57bc61'
        break
      case 56: // BSC Mainnet
        this.rpcUrl = 'https://bsc-dataseed.binance.org/'
        break
      default:
        this.rpcUrl = 'https://eth.llamarpc.com'
    }
  }

  // 获取Etherscan API URL
  private getEtherscanApiUrl(): string {
    switch (this.currentChainId) {
      case 1: // Ethereum Mainnet
        return 'https://api.etherscan.io/api'
      case 11155111: // Sepolia Testnet
        return 'https://api-sepolia.etherscan.io/api'
      case 137: // Polygon Mainnet
        return 'https://api.polygonscan.com/api'
      case 56: // BSC Mainnet
        return 'https://api.bscscan.com/api'
      default:
        return 'https://api.etherscan.io/api'
    }
  }

  // 获取钱包的交易历史
  async getWalletTransactions(address: string, limit: number = 20): Promise<Transaction[]> {
    try {
      if (!this.etherscanApiKey) {
        console.warn('Etherscan API key not provided, fallback to backend mock transactions')
        try {
          const resp = await fetch(`${this.apiBaseUrl}/api/transactions?address=${address}&page=1&limit=${limit}`)
          const data = await resp.json()
          const list = (data?.data?.transactions || data?.transactions || []).map((tx: any) => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value?.toString?.() || String(tx.value ?? '0'),
            timestamp: (typeof tx.timestamp === 'number' && tx.timestamp < 10_000_000_000) ? tx.timestamp * 1000 : tx.timestamp,
            blockNumber: tx.blockNumber || 0,
            gasUsed: String(tx.gasUsed ?? '0'),
            gasPrice: String(tx.gasPrice ?? '0'),
            status: tx.status === 'failed' ? 'failed' : 'success',
            isContractCreation: tx.to === 'Contract Creation'
          }))
          return list
        } catch (e) {
          console.error('后端交易数据回退失败:', e)
          return []
        }
      }

      const apiUrl = this.getEtherscanApiUrl()
      console.log(`正在获取地址 ${address} 的交易数据... (网络: ${this.currentChainId}, API: ${apiUrl})`)
      
      // 构建API请求URL
      const params = new URLSearchParams({
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: limit.toString(),
        sort: 'desc',
        apikey: this.etherscanApiKey
      })
      
      const response = await fetch(`${apiUrl}?${params}`)

      const data = await response.json()
      
      // 添加详细的API响应调试信息
      console.log('🔍 Etherscan API 响应详情:', {
        status: data.status,
        message: data.message,
        resultType: typeof data.result,
        resultLength: Array.isArray(data.result) ? data.result.length : 'not array',
        apiUrl: apiUrl
      })
      
      if (data.status === '1' && data.result && Array.isArray(data.result)) {
        console.log(`成功获取 ${data.result.length} 笔交易`)
        return data.result.map((tx: any) => {
          try {
            // 安全地转换时间戳
            const timestamp = tx.timeStamp ? parseInt(tx.timeStamp) * 1000 : Date.now()
            
            // 安全地转换数值
            const value = tx.value ? (parseInt(tx.value) / 1e18).toString() : '0'
            const blockNumber = tx.blockNumber ? parseInt(tx.blockNumber) : 0
            
            // 处理合约创建交易
            const isContractCreation = !tx.to || tx.to === '' || tx.to === '0x'
            const toAddress = isContractCreation ? 'Contract Creation' : (tx.to || '')
            
            return {
              hash: tx.hash || '',
              from: tx.from || '',
              to: toAddress,
              value: value,
              timestamp: timestamp,
              blockNumber: blockNumber,
              gasUsed: tx.gasUsed || '0',
              gasPrice: tx.gasPrice || '0',
              status: tx.isError === '0' ? 'success' : 'failed',
              isContractCreation: isContractCreation
            }
          } catch (mapError) {
            console.error('转换交易数据时出错:', mapError, tx)
            return null
          }
        }).filter((tx: any) => tx !== null) // 过滤掉转换失败的数据
      }

      if (data.message === 'No transactions found') {
        console.log(`地址 ${address} 没有交易记录`)
        return []
      }

      console.warn('Etherscan API 返回错误:', data.message)
      return []
    } catch (error) {
      console.error('获取交易数据失败:', error)
      return []
    }
  }

  // 获取钱包统计信息
  async getWalletStats(address: string): Promise<WalletStats> {
    try {
      console.log(`📊 开始获取钱包统计信息: ${address}`)
      // 若无 Etherscan API Key，直接使用后端统计，避免前端空数据导致全为0
      if (!this.etherscanApiKey) {
        const resp = await fetch(`${this.apiBaseUrl}/api/transactions/stats/${address}`)
        const data = await resp.json()
        const s = data?.data || data
        return {
          totalTransactions: Number(s?.totalTransactions ?? 0),
          totalValue: String(s?.totalVolume ?? '0'),
          riskTransactions: Number(s?.riskTransactions ?? 0),
          activeWallets: Number(s?.activeWallets ?? 0)
        }
      }

      const transactions = await this.getWalletTransactions(address, 100)
      
      console.log(`📊 获取到 ${transactions.length} 笔交易用于统计`)
      
      const totalTransactions = transactions.length
      
      // 安全地计算总价值（包括合约创建交易）
      let totalValue = 0
      try {
        totalValue = transactions
          .filter(tx => tx.status === 'success' && !isNaN(parseFloat(tx.value)))
          .reduce((sum, tx) => {
            const value = parseFloat(tx.value)
            return isNaN(value) ? sum : sum + value
          }, 0)
      } catch (valueError) {
        console.error('计算总价值时出错:', valueError)
        totalValue = 0
      }
      
      // 安全地计算风险交易（包括合约创建交易）
      let riskTransactions = 0
      try {
        riskTransactions = transactions.filter(tx => {
          const value = parseFloat(tx.value)
          // 合约创建交易、大额交易或失败交易都算作风险交易
          return tx.isContractCreation || (!isNaN(value) && value > 10) || tx.status === 'failed'
        }).length
      } catch (riskError) {
        console.error('计算风险交易时出错:', riskError)
        riskTransactions = 0
      }

      // 获取相关钱包数量（简化计算）
      let uniqueWallets = 0
      try {
        const walletSet = new Set()
        transactions.forEach(tx => {
          if (tx.from) walletSet.add(tx.from)
          // 对于合约创建交易，to 字段是 "Contract Creation"，不需要添加
          if (tx.to && tx.to !== 'Contract Creation') walletSet.add(tx.to)
        })
        uniqueWallets = walletSet.size
      } catch (walletError) {
        console.error('计算相关钱包数量时出错:', walletError)
        uniqueWallets = 0
      }

      const stats = {
        totalTransactions,
        totalValue: totalValue.toFixed(4),
        riskTransactions,
        activeWallets: uniqueWallets
      }
      
      console.log('📊 钱包统计结果:', stats)
      return stats
    } catch (error) {
      console.error('获取钱包统计失败，尝试后端回退:', error)
      try {
        const resp = await fetch(`${this.apiBaseUrl}/api/transactions/stats/${address}`)
        const data = await resp.json()
        const s = data?.data || data
        return {
          totalTransactions: Number(s?.totalTransactions ?? 0),
          totalValue: String(s?.totalVolume ?? '0'),
          riskTransactions: Number(s?.riskTransactions ?? 0),
          activeWallets: Number(s?.activeWallets ?? 0)
        }
      } catch (e) {
        console.error('后端统计回退失败:', e)
        return {
          totalTransactions: 0,
          totalValue: '0',
          riskTransactions: 0,
          activeWallets: 0
        }
      }
    }
  }

  // 获取代币余额
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      if (!this.etherscanApiKey) {
        console.log('Etherscan API key not provided, returning empty token balances')
        return []
      }

      const apiUrl = this.getEtherscanApiUrl()
      console.log(`正在获取地址 ${address} 的代币余额... (网络: ${this.currentChainId}, API: ${apiUrl})`)

      const response = await fetch(
        `${apiUrl}?module=account&action=tokentx&address=${address}&page=1&offset=100&sort=desc&apikey=${this.etherscanApiKey}`
      )

      const data = await response.json()
      
      console.log('🔍 代币API响应详情:', {
        status: data.status,
        message: data.message,
        resultCount: data.result ? data.result.length : 0
      })
      
      if (data.status === '1' && data.result && data.result.length > 0) {
        const tokenMap = new Map()
        
        data.result.forEach((tx: any) => {
          const tokenAddress = tx.contractAddress
          const symbol = tx.tokenSymbol
          const decimals = parseInt(tx.tokenDecimal)
          
          if (!tokenMap.has(tokenAddress)) {
            tokenMap.set(tokenAddress, {
              symbol,
              balance: '0', // 注意：这里只是记录代币类型，实际余额需要单独查询
              value: '0',
              contractAddress: tokenAddress,
              decimals
            })
          }
        })

        const tokens = Array.from(tokenMap.values())
        console.log(`✅ 找到 ${tokens.length} 种代币类型`)
        return tokens
      }

      if (data.message === 'No transactions found') {
        console.log(`地址 ${address} 没有代币交易记录 - 这是正常的，表示该地址没有与ERC-20代币交互`)
        return []
      }

      console.warn('获取代币余额失败:', data.message)
      return []
    } catch (error) {
      console.error('获取代币余额失败:', error)
      return []
    }
  }

  // 获取 ETH 余额
  async getETHBalance(address: string): Promise<string> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      })

      const data = await response.json()
      
      if (data.result) {
        const balance = parseInt(data.result, 16) / 1e18
        return balance.toFixed(4)
      }

      return '0'
    } catch (error) {
      console.error('获取 ETH 余额失败:', error)
      return '0'
    }
  }

}

export const blockchainService = new BlockchainService()

// 将 blockchainService 暴露到全局，方便调试
if (typeof window !== 'undefined') {
  (window as any).blockchainService = blockchainService
}
