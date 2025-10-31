/**
 * 环境变量测试工具
 */

export const testEnvironmentVariables = () => {
  console.log('🧪 环境变量测试开始...')
  
  const envVars = {
    // API 配置
    VITE_ETHERSCAN_API_KEY: import.meta.env.VITE_ETHERSCAN_API_KEY,
    
    // 网络配置
    VITE_RPC_URL_MAINNET: import.meta.env.VITE_RPC_URL_MAINNET,
    VITE_RPC_URL_SEPOLIA: import.meta.env.VITE_RPC_URL_SEPOLIA,
    VITE_RPC_URL_POLYGON: import.meta.env.VITE_RPC_URL_POLYGON,
    VITE_RPC_URL_BSC: import.meta.env.VITE_RPC_URL_BSC,
    
    // WalletConnect 配置
    VITE_WALLETCONNECT_PROJECT_ID: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    
    // 应用配置
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
    
    // 环境信息
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD
  }
  
  console.log('📋 所有环境变量:', envVars)
  
  // 检查关键配置
  const criticalVars = [
    'VITE_ETHERSCAN_API_KEY',
    'VITE_RPC_URL_SEPOLIA'
  ]
  
  const missingVars = criticalVars.filter(key => !envVars[key as keyof typeof envVars])
  
  if (missingVars.length > 0) {
    console.error('❌ 缺少关键环境变量:', missingVars)
    return {
      success: false,
      message: `缺少关键环境变量: ${missingVars.join(', ')}`,
      missingVars
    }
  }
  
  // 检查 API 密钥格式
  const apiKey = envVars.VITE_ETHERSCAN_API_KEY
  if (apiKey && apiKey.length < 10) {
    console.warn('⚠️ API密钥长度可能不足:', apiKey.length)
  }
  
  console.log('✅ 环境变量检查完成')
  return {
    success: true,
    message: '环境变量配置正常',
    envVars
  }
}

export const testEtherscanApiKey = async (address?: string) => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY
  
  if (!apiKey) {
    return {
      success: false,
      message: 'API密钥未配置',
      error: 'VITE_ETHERSCAN_API_KEY 未设置'
    }
  }
  
  // 测试 Sepolia 网络
  const testUrl = 'https://api-sepolia.etherscan.io/api'
  const testAddress = address || '0x742d35Cc6634C0532925a3b8D0C0C2b8C8C8C8C8' // 使用传入地址或示例地址
  
  const params = new URLSearchParams({
    module: 'account',
    action: 'txlist',
    address: testAddress,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '1',
    sort: 'desc',
    apikey: apiKey
  })
  
  try {
    console.log('🧪 测试 Etherscan API...')
    const response = await fetch(`${testUrl}?${params}`)
    const data = await response.json()
    
    console.log('📊 API 响应:', {
      status: data.status,
      message: data.message,
      resultType: typeof data.result,
      resultLength: Array.isArray(data.result) ? data.result.length : 'not array',
      address: testAddress,
      apiUrl: testUrl
    })
    
    if (data.status === '1') {
      return {
        success: true,
        message: 'API密钥有效',
        details: {
          network: 'Sepolia',
          resultCount: data.result?.length || 0
        }
      }
    } else if (data.message === 'NOTOK') {
      return {
        success: false,
        message: 'API密钥无效或已过期',
        error: data.message
      }
    } else if (data.message === 'Invalid API Key') {
      return {
        success: false,
        message: 'API密钥格式错误',
        error: data.message
      }
    } else {
      return {
        success: false,
        message: 'API调用失败',
        error: data.message
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: '网络请求失败',
      error: error.message
    }
  }
}
