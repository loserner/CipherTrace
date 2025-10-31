/**
 * API错误诊断工具
 */

export interface ApiErrorDiagnosis {
  error: string
  possibleCauses: string[]
  solutions: string[]
  apiKeyStatus: 'missing' | 'invalid' | 'valid' | 'unknown'
  networkStatus: 'correct' | 'incorrect' | 'unknown'
}

export const diagnoseApiError = (error: string, chainId?: number): ApiErrorDiagnosis => {
  const diagnosis: ApiErrorDiagnosis = {
    error,
    possibleCauses: [],
    solutions: [],
    apiKeyStatus: 'unknown',
    networkStatus: 'unknown'
  }

  // 检查API密钥状态
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY
  if (!apiKey) {
    diagnosis.apiKeyStatus = 'missing'
    diagnosis.possibleCauses.push('API密钥未配置')
    diagnosis.solutions.push('在 frontend/.env 文件中添加 VITE_ETHERSCAN_API_KEY=你的API密钥')
  } else if (apiKey === 'YOUR_ETHERSCAN_API_KEY') {
    diagnosis.apiKeyStatus = 'invalid'
    diagnosis.possibleCauses.push('API密钥使用默认值')
    diagnosis.solutions.push('将 YOUR_ETHERSCAN_API_KEY 替换为真实的API密钥')
  } else {
    diagnosis.apiKeyStatus = 'valid'
  }

  // 检查网络状态
  if (chainId) {
    const supportedNetworks = [1, 11155111, 137, 56]
    if (supportedNetworks.includes(chainId)) {
      diagnosis.networkStatus = 'correct'
    } else {
      diagnosis.networkStatus = 'incorrect'
      diagnosis.possibleCauses.push('不支持的网络')
      diagnosis.solutions.push('切换到支持的网络（如Sepolia测试网）')
    }
  }

  // 根据错误类型添加更多诊断信息
  if (error === 'NOTOK') {
    diagnosis.possibleCauses.push('API密钥无效或过期')
    diagnosis.possibleCauses.push('API密钥没有足够权限')
    diagnosis.possibleCauses.push('API密钥格式错误')
    diagnosis.possibleCauses.push('网络配置与API端点不匹配')
    
    diagnosis.solutions.push('检查API密钥是否正确且有效')
    diagnosis.solutions.push('确认API密钥有足够的请求配额')
    diagnosis.solutions.push('验证API密钥格式（无空格、换行符）')
    diagnosis.solutions.push('确保网络配置与API端点匹配')
  }

  return diagnosis
}

export const testApiKeyDirectly = async (): Promise<{
  success: boolean
  error?: string
  details: any
}> => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY
  
  if (!apiKey) {
    return {
      success: false,
      error: 'API密钥未配置',
      details: null
    }
  }

  // 测试主网API
  try {
    const mainnetUrl = `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${apiKey}`
    console.log('🔍 测试主网API:', mainnetUrl)
    
    const response = await fetch(mainnetUrl)
    const data = await response.json()
    
    console.log('📡 主网API响应:', data)
    
    if (data.result) {
      return {
        success: true,
        details: {
          network: 'Ethereum Mainnet',
          blockNumber: data.result,
          apiKey: apiKey.substring(0, 8) + '...' // 只显示前8位
        }
      }
    } else {
      return {
        success: false,
        error: data.message || '主网API返回错误',
        details: data
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      details: null
    }
  }
}

export const testSepoliaApi = async (): Promise<{
  success: boolean
  error?: string
  details: any
}> => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY
  
  if (!apiKey) {
    return {
      success: false,
      error: 'API密钥未配置',
      details: null
    }
  }

  // 测试Sepolia API
  try {
    const sepoliaUrl = `https://api-sepolia.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${apiKey}`
    console.log('🔍 测试Sepolia API:', sepoliaUrl)
    
    const response = await fetch(sepoliaUrl)
    const data = await response.json()
    
    console.log('📡 Sepolia API响应:', data)
    
    if (data.result) {
      return {
        success: true,
        details: {
          network: 'Sepolia Testnet',
          blockNumber: data.result,
          apiKey: apiKey.substring(0, 8) + '...'
        }
      }
    } else {
      return {
        success: false,
        error: data.message || 'Sepolia API返回错误',
        details: data
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      details: null
    }
  }
}

export const getDetailedApiHelp = (): string => {
  return `
🔧 API密钥详细配置指南

1. 获取Etherscan API密钥：
   - 访问: https://etherscan.io/apis
   - 注册账户并登录
   - 点击 "Add" 创建新的API密钥
   - 复制完整的API密钥（通常很长，包含字母和数字）

2. 配置API密钥：
   在 frontend/.env 文件中添加：
   VITE_ETHERSCAN_API_KEY=你的完整API密钥
   
   注意：
   - 不要包含引号
   - 不要有空格
   - 确保在一行内
   - 不要使用默认值

3. 验证配置：
   - 重启开发服务器: npm run dev
   - 检查控制台是否还有 NOTOK 错误
   - 使用"测试密钥"按钮验证

4. 常见问题解决：
   - NOTOK错误: API密钥无效或格式错误
   - 权限不足: 确保API密钥有效且有配额
   - 网络不匹配: 确保连接到正确的网络

5. 测试步骤：
   1. 点击"验证密钥"检查配置
   2. 点击"测试密钥"验证有效性
   3. 点击"测试API"检查交易数据
   4. 查看控制台日志确认成功

6. 如果仍有问题：
   - 检查 .env 文件是否在正确位置
   - 确认API密钥完整且正确
   - 尝试重新生成API密钥
   - 检查网络连接
  `
}
