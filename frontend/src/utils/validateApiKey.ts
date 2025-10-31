/**
 * API密钥验证工具
 */

export interface ApiKeyValidationResult {
  isValid: boolean
  error?: string
  suggestions: string[]
}

export const validateApiKey = (): ApiKeyValidationResult => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY
  const suggestions: string[] = []

  // 检查API密钥是否存在
  if (!apiKey) {
    return {
      isValid: false,
      error: 'API密钥未配置',
      suggestions: [
        '在 frontend/.env 文件中添加 VITE_ETHERSCAN_API_KEY=你的API密钥',
        '重启开发服务器 (npm run dev)',
        '确保 .env 文件在 frontend 目录下'
      ]
    }
  }

  // 检查是否是默认值
  if (apiKey === 'YOUR_ETHERSCAN_API_KEY') {
    return {
      isValid: false,
      error: 'API密钥使用默认值',
      suggestions: [
        '请将 YOUR_ETHERSCAN_API_KEY 替换为真实的API密钥',
        '访问 https://etherscan.io/apis 申请API密钥',
        '将获得的API密钥添加到 .env 文件中'
      ]
    }
  }

  // 检查API密钥格式
  if (apiKey.length < 10) {
    return {
      isValid: false,
      error: 'API密钥格式可能不正确',
      suggestions: [
        'Etherscan API密钥通常较长（20+字符）',
        '请检查API密钥是否完整复制',
        '重新从Etherscan获取API密钥'
      ]
    }
  }

  // 检查是否包含特殊字符
  if (apiKey.includes(' ') || apiKey.includes('\n') || apiKey.includes('\r')) {
    return {
      isValid: false,
      error: 'API密钥包含无效字符',
      suggestions: [
        'API密钥不应包含空格或换行符',
        '请检查 .env 文件格式',
        '确保API密钥在一行内'
      ]
    }
  }

  return {
    isValid: true,
    suggestions: [
      'API密钥格式正确',
      '如果仍有问题，请检查API密钥是否有效',
      '确认API密钥有足够的请求配额'
    ]
  }
}

export const testApiKeyWithNetwork = async (chainId: number): Promise<{
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

  const apiUrls: Record<number, string> = {
    1: 'https://api.etherscan.io/api',
    11155111: 'https://api-sepolia.etherscan.io/api',
    137: 'https://api.polygonscan.com/api',
    56: 'https://api.bscscan.com/api'
  }

  const apiUrl = apiUrls[chainId] || 'https://api.etherscan.io/api'

  try {
    // 使用一个简单的API调用来测试密钥
    const testUrl = `${apiUrl}?module=proxy&action=eth_blockNumber&apikey=${apiKey}`
    console.log('🔍 测试API密钥:', { chainId, apiUrl, testUrl })
    
    const response = await fetch(testUrl)
    const data = await response.json()
    
    console.log('📡 API密钥测试响应:', data)

    if (data.result) {
      return {
        success: true,
        details: {
          blockNumber: data.result,
          apiUrl,
          chainId
        }
      }
    } else {
      return {
        success: false,
        error: data.message || 'API返回错误',
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

export const getApiKeyHelp = (): string => {
  return `
🔑 API密钥配置帮助

1. 获取API密钥：
   - 访问 https://etherscan.io/apis
   - 注册账户并登录
   - 点击 "Add" 创建新的API密钥
   - 复制生成的API密钥

2. 配置API密钥：
   - 在 frontend/.env 文件中添加：
     VITE_ETHERSCAN_API_KEY=你的API密钥
   - 确保没有多余的空格或引号
   - 重启开发服务器

3. 验证配置：
   - 检查控制台是否还有 NOTOK 错误
   - 使用"测试API"按钮验证
   - 确认能获取到交易数据

4. 常见问题：
   - 确保API密钥有效且有足够配额
   - 检查网络配置是否正确
   - 确认API密钥格式正确
  `
}
