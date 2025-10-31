/**
 * 网络连接测试工具
 */

export interface NetworkTestResult {
  success: boolean
  network: string
  chainId: number
  blockNumber?: number
  error?: string
}

export const testNetworkConnection = async (): Promise<NetworkTestResult> => {
  try {
    if (!window.ethereum) {
      return {
        success: false,
        network: 'Unknown',
        chainId: 0,
        error: 'MetaMask 未安装'
      }
    }

    // 获取当前网络信息
    const chainId = await window.ethereum.request({ method: 'eth_chainId' })
    const chainIdNumber = parseInt(chainId, 16)
    
    // 获取最新区块号
    const blockNumber = await window.ethereum.request({ method: 'eth_blockNumber' })
    const blockNumberNumber = parseInt(blockNumber, 16)

    // 根据链ID确定网络名称
    let networkName = 'Unknown Network'
    switch (chainIdNumber) {
      case 1:
        networkName = 'Ethereum Mainnet'
        break
      case 11155111:
        networkName = 'Sepolia Testnet'
        break
      case 137:
        networkName = 'Polygon Mainnet'
        break
      case 56:
        networkName = 'BSC Mainnet'
        break
      default:
        networkName = `Unknown Network (${chainIdNumber})`
    }

    return {
      success: true,
      network: networkName,
      chainId: chainIdNumber,
      blockNumber: blockNumberNumber
    }
  } catch (error: any) {
    return {
      success: false,
      network: 'Unknown',
      chainId: 0,
      error: error.message || '网络连接测试失败'
    }
  }
}

export const testEtherscanAPI = async (chainId: number, apiKey: string): Promise<boolean> => {
  try {
    let apiUrl = ''
    switch (chainId) {
      case 1:
        apiUrl = 'https://api.etherscan.io/api'
        break
      case 11155111:
        apiUrl = 'https://api-sepolia.etherscan.io/api'
        break
      case 137:
        apiUrl = 'https://api.polygonscan.com/api'
        break
      case 56:
        apiUrl = 'https://api.bscscan.com/api'
        break
      default:
        return false
    }

    const response = await fetch(
      `${apiUrl}?module=proxy&action=eth_blockNumber&apikey=${apiKey}`
    )
    
    const data = await response.json()
    return data.result !== undefined
  } catch (error) {
    console.error('Etherscan API 测试失败:', error)
    return false
  }
}

export const runFullNetworkTest = async (): Promise<{
  network: NetworkTestResult
  api: boolean
  recommendations: string[]
}> => {
  const networkTest = await testNetworkConnection()
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY
  
  let apiTest = false
  if (apiKey && networkTest.success) {
    apiTest = await testEtherscanAPI(networkTest.chainId, apiKey)
  }

  const recommendations: string[] = []
  
  if (!networkTest.success) {
    recommendations.push('请安装并连接 MetaMask 钱包')
  }
  
  if (!apiKey) {
    recommendations.push('请配置 VITE_ETHERSCAN_API_KEY 环境变量')
  } else if (!apiTest) {
    recommendations.push('Etherscan API 密钥可能无效或网络不支持')
  }
  
  if (networkTest.chainId === 1 && !apiTest) {
    recommendations.push('建议切换到测试网进行测试')
  }

  return {
    network: networkTest,
    api: apiTest,
    recommendations
  }
}
