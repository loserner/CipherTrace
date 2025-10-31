import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NetworkSwitcher from '../network/NetworkSwitcher'

const Header = () => {
  const [walletState, setWalletState] = useState({
    isConnected: false,
    address: null as string | null
  })

  // 检查钱包连接状态
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          })
          
          if (accounts.length > 0) {
            setWalletState({
              isConnected: true,
              address: accounts[0]
            })
          }
        } catch (error) {
          console.error('检查钱包连接状态失败:', error)
        }
      }
    }

    checkWalletConnection()

    // 监听账户变化
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletState({
            isConnected: true,
            address: accounts[0]
          })
        } else {
          setWalletState({
            isConnected: false,
            address: null
          })
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  // 连接钱包
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('请安装 MetaMask 钱包')
      return
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        setWalletState({
          isConnected: true,
          address: accounts[0]
        })
      }
    } catch (error: any) {
      console.error('连接钱包失败:', error)
      alert('连接钱包失败: ' + (error.message || '未知错误'))
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null
    })
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              交易分析 DApp
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <NetworkSwitcher />
            {walletState.isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">钱包已连接</span>
                </div>
                <div className="text-sm text-gray-600">
                  {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                >
                  断开连接
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">未连接钱包</span>
                </div>
                <button
                  onClick={connectWallet}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  连接钱包
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
