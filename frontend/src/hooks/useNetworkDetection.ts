import { useState, useEffect } from 'react'
import { blockchainService } from '../services/blockchain'

// 扩展 Window 接口以包含 ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

interface NetworkInfo {
  chainId: number
  chainName: string
  isTestnet: boolean
  rpcUrl: string
  blockExplorer: string
}

const NETWORK_CONFIG: Record<number, NetworkInfo> = {
  1: {
    chainId: 1,
    chainName: 'Ethereum Mainnet',
    isTestnet: false,
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io'
  },
  11155111: {
    chainId: 11155111,
    chainName: 'Sepolia Testnet',
    isTestnet: true,
    rpcUrl: 'https://sepolia.infura.io/v3/2d21ac762aa444fab40c9822ba57bc61',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  137: {
    chainId: 137,
    chainName: 'Polygon Mainnet',
    isTestnet: false,
    rpcUrl: 'https://polygon-mainnet.infura.io/v3/2d21ac762aa444fab40c9822ba57bc61',
    blockExplorer: 'https://polygonscan.com'
  },
  56: {
    chainId: 56,
    chainName: 'BSC Mainnet',
    isTestnet: false,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    blockExplorer: 'https://bscscan.com'
  }
}

export const useNetworkDetection = () => {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkInfo | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [loading, setLoading] = useState(false)

  // 检测当前网络
  const detectNetwork = async () => {
    if (!window.ethereum) {
      console.warn('MetaMask 未安装')
      return
    }

    setLoading(true)
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      const chainIdNumber = parseInt(chainId, 16)
      
      console.log('检测到链ID:', chainIdNumber)
      
      const networkInfo = NETWORK_CONFIG[chainIdNumber]
      if (networkInfo) {
        setCurrentNetwork(networkInfo)
        setIsSupported(true)
        
        // 更新区块链服务的网络配置
        console.log('🔄 准备更新 blockchainService 网络配置...')
        blockchainService.setCurrentNetwork(chainIdNumber)
        
        console.log('✅ 网络检测完成:', {
          chainName: networkInfo.chainName,
          chainId: chainIdNumber,
          isTestnet: networkInfo.isTestnet
        })
      } else {
        setCurrentNetwork({
          chainId: chainIdNumber,
          chainName: `Unknown Network (${chainIdNumber})`,
          isTestnet: false,
          rpcUrl: '',
          blockExplorer: ''
        })
        setIsSupported(false)
        console.warn('不支持的网络:', chainIdNumber)
      }
    } catch (error) {
      console.error('检测网络失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 切换网络
  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) {
      throw new Error('MetaMask 未安装')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }]
      })
      
      // 切换成功后重新检测网络
      await detectNetwork()
    } catch (error: any) {
      // 如果网络不存在，尝试添加网络
      if (error.code === 4902) {
        const networkInfo = NETWORK_CONFIG[targetChainId]
        if (networkInfo) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: networkInfo.chainName,
                rpcUrls: [networkInfo.rpcUrl],
                blockExplorerUrls: [networkInfo.blockExplorer]
              }]
            })
            
            // 添加成功后重新检测网络
            await detectNetwork()
          } catch (addError) {
            console.error('添加网络失败:', addError)
            throw addError
          }
        }
      } else {
        console.error('切换网络失败:', error)
        throw error
      }
    }
  }

  // 监听网络变化
  useEffect(() => {
    if (!window.ethereum) return

    // 初始检测
    detectNetwork()

    // 监听网络变化
    const handleChainChanged = (chainId: string) => {
      console.log('网络已切换:', chainId)
      detectNetwork()
    }

    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  return {
    currentNetwork,
    isSupported,
    loading,
    detectNetwork,
    switchNetwork,
    supportedNetworks: Object.values(NETWORK_CONFIG)
  }
}
