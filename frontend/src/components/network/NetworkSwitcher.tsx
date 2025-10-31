import React, { useState } from 'react'
import { useNetworkDetection } from '../../hooks/useNetworkDetection'

const NetworkSwitcher: React.FC = () => {
  const { currentNetwork, isSupported, switchNetwork, supportedNetworks } = useNetworkDetection()
  const [isOpen, setIsOpen] = useState(false)

  const handleNetworkSwitch = async (chainId: number) => {
    try {
      await switchNetwork(chainId)
      setIsOpen(false)
    } catch (error) {
      console.error('切换网络失败:', error)
    }
  }

  if (!currentNetwork) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isSupported
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        }`}
      >
        <div className={`w-2 h-2 rounded-full mr-2 ${
          isSupported ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        {currentNetwork.chainName}
        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              选择网络
            </div>
            {supportedNetworks.map((network) => (
              <button
                key={network.chainId}
                onClick={() => handleNetworkSwitch(network.chainId)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                  currentNetwork.chainId === network.chainId
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    currentNetwork.chainId === network.chainId ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></div>
                  <div className="text-left">
                    <div className="font-medium">{network.chainName}</div>
                    <div className="text-xs text-gray-500">
                      链ID: {network.chainId}
                      {network.isTestnet && ' (测试网)'}
                    </div>
                  </div>
                </div>
                {currentNetwork.chainId === network.chainId && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NetworkSwitcher
