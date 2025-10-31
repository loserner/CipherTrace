/**
 * API调用测试工具
 */

export const testApiCall = async (address: string, chainId: number) => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY
  
  if (!apiKey) {
    console.error('❌ API密钥未配置')
    return { success: false, error: 'API密钥未配置' }
  }

  const apiUrls: Record<number, string> = {
    1: 'https://api.etherscan.io/api',
    11155111: 'https://api-sepolia.etherscan.io/api',
    137: 'https://api.polygonscan.com/api',
    56: 'https://api.bscscan.com/api'
  }

  const apiUrl = apiUrls[chainId] || 'https://api.etherscan.io/api'
  
  console.log('🔍 测试API调用:', {
    address,
    chainId,
    apiUrl,
    hasApiKey: !!apiKey
  })

  try {
    const url = `${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${apiKey}`
    console.log('📡 API请求URL:', url)
    
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('📡 API响应:', {
      status: data.status,
      message: data.message,
      resultCount: data.result?.length || 0,
      result: data.result?.slice(0, 2) || [] // 只显示前2条结果
    })

    if (data.status === '1') {
      console.log('✅ API调用成功')
      return { 
        success: true, 
        data: data.result,
        count: data.result?.length || 0
      }
    } else {
      console.error('❌ API返回错误:', data.message)
      return { 
        success: false, 
        error: data.message,
        data: data
      }
    }
  } catch (error: any) {
    console.error('❌ API调用失败:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

export const testCurrentWallet = async () => {
  if (!window.ethereum) {
    console.error('❌ MetaMask未安装')
    return
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    if (accounts.length === 0) {
      console.error('❌ 钱包未连接')
      return
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' })
    const chainIdNumber = parseInt(chainId, 16)
    
    console.log('🔍 当前钱包信息:', {
      address: accounts[0],
      chainId: chainIdNumber
    })

    const result = await testApiCall(accounts[0], chainIdNumber)
    return result
  } catch (error: any) {
    console.error('❌ 获取钱包信息失败:', error)
  }
}
