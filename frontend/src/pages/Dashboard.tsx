import { useState, useEffect } from 'react'
import TransactionChart from '../components/charts/TransactionChart'
import VolumeChart from '../components/charts/VolumeChart'
import { useWalletData } from '../hooks/useWalletData'
import { useNetworkDetection } from '../hooks/useNetworkDetection'
import { testEnvironmentVariables, testEtherscanApiKey } from '../utils/testEnv'

// 扩展 Window 接口以包含 ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

// 扩展 ImportMeta 接口以包含 env
declare global {
  interface ImportMeta {
    env: {
      VITE_ETHERSCAN_API_KEY?: string
      [key: string]: any
    }
  }
}

const Dashboard = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const { transactions, stats, tokenBalances, ethBalance, loading, error, refetch } = useWalletData(walletAddress)
  const { currentNetwork, isSupported, switchNetwork } = useNetworkDetection()

  // 检查钱包连接状态
  useEffect(() => {
    const checkWalletConnection = async () => {
      console.log('🔍 检查钱包连接状态...')
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          })
          
          console.log('📱 获取到的账户:', accounts)
          if (accounts.length > 0) {
            console.log('✅ 设置钱包地址:', accounts[0])
            setWalletAddress(accounts[0])
          } else {
            console.log('❌ 没有连接的账户')
            setWalletAddress(null)
          }
        } catch (error) {
          console.error('检查钱包连接状态失败:', error)
        }
      } else {
        console.log('❌ 没有检测到 ethereum 对象')
      }
    }

    checkWalletConnection()

    // 监听账户变化
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('🔄 账户变化事件:', accounts)
        if (accounts.length > 0) {
          console.log('✅ 账户变化 - 设置新地址:', accounts[0])
          setWalletAddress(accounts[0])
        } else {
          console.log('❌ 账户变化 - 清空地址')
          setWalletAddress(null)
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  // 监听钱包地址变化
  useEffect(() => {
    console.log('🔄 钱包地址变化:', walletAddress)
  }, [walletAddress])

  // 测试环境变量
  const testEnvVars = async () => {
    const result = testEnvironmentVariables()
    console.log('🧪 环境变量测试结果:', result)
    
    if (result.success) {
      alert(`环境变量测试成功！\n${result.message}`)
    } else {
      alert(`环境变量测试失败！\n${result.message}`)
    }
  }

  // 测试 API 密钥
  const testApiKey = async () => {
    const result = await testEtherscanApiKey(walletAddress || undefined)
    console.log('🧪 API密钥测试结果:', result)
    
    if (result.success) {
      alert(`API密钥测试成功！\n${result.message}\n交易数量: ${result.details?.resultCount || 0}`)
    } else {
      alert(`API密钥测试失败！\n${result.message}\n错误: ${result.error}`)
    }
  }

  // 手动连接钱包
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        console.log('🔌 尝试连接钱包...')
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        
        if (accounts.length > 0) {
          console.log('✅ 钱包连接成功:', accounts[0])
          setWalletAddress(accounts[0])
        }
      } catch (error) {
        console.error('❌ 钱包连接失败:', error)
        alert('钱包连接失败，请重试')
      }
    } else {
      alert('请安装 MetaMask 钱包')
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          交易分析仪表板
        </h1>
        <p className="text-gray-600">
          基于区块链的交易数据分析和风险评估平台
        </p>
        
        {/* 网络状态显示 */}
        {currentNetwork && (
          <div className={`mt-4 p-4 rounded-lg border ${
            isSupported 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  isSupported ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className={`text-sm font-medium ${
                    isSupported ? 'text-green-800' : 'text-red-800'
                  }`}>
                    当前网络: {currentNetwork.chainName}
                    {currentNetwork.isTestnet && ' (测试网)'}
                  </p>
                  <p className={`text-xs ${
                    isSupported ? 'text-green-600' : 'text-red-600'
                  }`}>
                    链ID: {currentNetwork.chainId}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {!isSupported && (
                  <button
                    onClick={() => switchNetwork(11155111)} // 切换到Sepolia测试网
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    切换到测试网
                  </button>
                )}
                <button
                  onClick={testEnvVars}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  测试环境变量
                </button>
                <button
                  onClick={testApiKey}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                >
                  测试API密钥
                </button>
              </div>
            </div>
          </div>
        )}
        
        {walletAddress ? (
                      <div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-gray-500">
                            连接钱包: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                          </p>
                          <button
                            onClick={refetch}
                            disabled={loading}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {loading ? '刷新中...' : '刷新数据'}
                          </button>
                        </div>
                        {!import.meta.env.VITE_ETHERSCAN_API_KEY && (
                          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  <strong>提示：</strong>当前显示的是模拟数据。要查看真实交易记录，请在 <code className="bg-yellow-100 px-1 rounded">frontend/.env</code> 文件中设置 <code className="bg-yellow-100 px-1 rounded">VITE_ETHERSCAN_API_KEY</code>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm text-blue-700">
                              请先连接您的钱包以查看个人交易数据和分析结果
                            </p>
                            <button
                              onClick={connectWallet}
                              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              连接钱包
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">总交易数</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-blue-600">
                {stats?.totalTransactions || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">历史交易总数</p>
            </>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ETH 余额</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-green-600">
                {ethBalance} ETH
              </p>
              <p className="text-sm text-gray-500 mt-1">当前余额</p>
            </>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">风险交易</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-red-600">
                {stats?.riskTransactions || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">需要关注</p>
            </>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">代币种类</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-purple-600">
                {tokenBalances.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">持有代币</p>
              {tokenBalances.length === 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  暂无代币交易记录
                </p>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">交易趋势</h3>
          <TransactionChart walletAddress={walletAddress} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">交易量分析</h3>
          <VolumeChart walletAddress={walletAddress} />
        </div>
      </div>
      
      {/* Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">最近交易</h3>
            {walletAddress && (
              <button
                onClick={refetch}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {loading ? '刷新中...' : '刷新'}
              </button>
            )}
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => {
                const isIncoming = tx.to.toLowerCase() === walletAddress?.toLowerCase()
                const timeAgo = new Date(tx.timestamp).toLocaleString('zh-CN')
                
                return (
                  <div key={tx.hash} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">
                        {isIncoming ? '从' : '到'} {isIncoming ? tx.from.slice(0, 6) : tx.to.slice(0, 6)}...{isIncoming ? tx.from.slice(-4) : tx.to.slice(-4)}
                      </p>
                      <p className="text-sm text-gray-500">{timeAgo}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${isIncoming ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncoming ? '+' : '-'}{parseFloat(tx.value).toFixed(4)} ETH
                      </span>
                      <p className="text-xs text-gray-400">
                        {tx.status === 'failed' ? '失败' : '成功'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex flex-col items-center">
                <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 mb-2">该钱包暂无交易记录</p>
                <p className="text-sm text-gray-400">这是一个新钱包或从未进行过交易</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">代币余额</h3>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : tokenBalances.length > 0 ? (
            <div className="space-y-4">
              {tokenBalances.map((token, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-900 font-medium">{token.symbol}</span>
                    <p className="text-sm text-gray-500">{token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900 font-semibold">{token.balance}</span>
                    <p className="text-sm text-gray-500">${token.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无代币余额</p>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-3">交易统计</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">总交易数</span>
                <span className="text-blue-600 font-semibold">{stats?.totalTransactions || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">风险交易</span>
                <span className="text-red-600 font-semibold">{stats?.riskTransactions || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">总价值</span>
                <span className="text-green-600 font-semibold">{stats?.totalValue || '0'} ETH</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Dashboard