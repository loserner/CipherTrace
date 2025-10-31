import { useState, useEffect } from 'react'

interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: number | null
  error: string | null
}

const SimpleWalletConnect = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    error: null
  })

  // 检查是否已安装 MetaMask
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
  }

  // 连接钱包
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setWalletState(prev => ({
        ...prev,
        error: '请安装 MetaMask 钱包'
      }))
      return
    }

    try {
      setWalletState(prev => ({ ...prev, error: null }))
      
      // 请求连接钱包
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        const address = accounts[0]
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        })

        setWalletState({
          isConnected: true,
          address,
          chainId: parseInt(chainId, 16),
          error: null
        })
      }
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        error: error.message || '连接钱包失败'
      }))
    }
  }

  // 断开连接
  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      error: null
    })
  }

  // 监听账户变化
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletState({
          isConnected: false,
          address: null,
          chainId: null,
          error: null
        })
      } else {
        setWalletState(prev => ({
          ...prev,
          address: accounts[0]
        }))
      }
    }

    const handleChainChanged = (chainId: string) => {
      setWalletState(prev => ({
        ...prev,
        chainId: parseInt(chainId, 16)
      }))
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  // 检查是否已连接
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        })

        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({
            method: 'eth_chainId'
          })

          setWalletState({
            isConnected: true,
            address: accounts[0],
            chainId: parseInt(chainId, 16),
            error: null
          })
        }
      } catch (error) {
        console.error('检查钱包连接状态失败:', error)
      }
    }

    checkConnection()
  }, [])

  if (!isMetaMaskInstalled()) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">需要安装 MetaMask</h3>
        <p className="text-sm text-yellow-700 mb-3">
          请先安装 MetaMask 钱包扩展程序
        </p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          下载 MetaMask
        </a>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="font-medium text-gray-900 mb-3">钱包连接</h3>
      
      {walletState.error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {walletState.error}
        </div>
      )}

      {walletState.isConnected ? (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>已连接:</strong> {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
            </p>
            <p className="text-sm text-green-600">
              <strong>网络:</strong> {walletState.chainId === 1 ? 'Ethereum 主网' : `链 ID: ${walletState.chainId}`}
            </p>
          </div>
          <button
            onClick={disconnectWallet}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            断开连接
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          连接 MetaMask
        </button>
      )}
    </div>
  )
}

export default SimpleWalletConnect
