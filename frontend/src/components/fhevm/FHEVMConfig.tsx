import React, { useState, useEffect } from 'react';
import { useFHEVM } from '../../hooks/useFHEVM';
import { Shield, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface FHEVMConfigProps {
  onConfigComplete?: (success: boolean) => void;
}

export const FHEVMConfig: React.FC<FHEVMConfigProps> = ({ onConfigComplete }) => {
  const {
    isInitialized,
    status,
    isLoading,
    error,
    initialize,
    setContractAddresses,
    reset,
    refreshStatus,
    healthCheck
  } = useFHEVM();

  const [rpcUrl, setRpcUrl] = useState('http://localhost:8545');
  const [privateKey, setPrivateKey] = useState('');
  const [transactionAnalyzerAddress, setTransactionAnalyzerAddress] = useState('');
  const [privateAnalyzerAddress, setPrivateAnalyzerAddress] = useState('');
  const [fhevmInterfaceAddress, setFhevmInterfaceAddress] = useState('');
  const [isHealthy, setIsHealthy] = useState(false);

  // 健康检查
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await healthCheck();
      setIsHealthy(healthy);
    };
    
    if (isInitialized) {
      checkHealth();
    }
  }, [isInitialized, healthCheck]);

  // 处理初始化
  const handleInitialize = async () => {
    if (!rpcUrl || !privateKey) {
      alert('请填写RPC URL和私钥');
      return;
    }

    const success = await initialize(rpcUrl, privateKey);
    if (success && onConfigComplete) {
      onConfigComplete(true);
    }
  };

  // 处理合约地址设置
  const handleSetContracts = async () => {
    if (!transactionAnalyzerAddress || !privateAnalyzerAddress || !fhevmInterfaceAddress) {
      alert('请填写合约地址');
      return;
    }

    const success = await setContractAddresses(transactionAnalyzerAddress, privateAnalyzerAddress, fhevmInterfaceAddress);
    if (success) {
      alert('合约地址设置成功');
    }
  };

  // 处理重置
  const handleReset = async () => {
    if (window.confirm('确定要重置FHEVM服务吗？')) {
      await reset();
    }
  };

  // 刷新状态
  const handleRefreshStatus = async () => {
    await refreshStatus();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">FHEVM 配置</h2>
      </div>

      {/* 状态显示 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          服务状态
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {isInitialized ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium">FHEVM 初始化</span>
            <span className={`px-2 py-1 rounded text-sm ${
              isInitialized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isInitialized ? '已初始化' : '未初始化'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isHealthy ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <span className="font-medium">健康状态</span>
            <span className={`px-2 py-1 rounded text-sm ${
              isHealthy ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isHealthy ? '健康' : '异常'}
            </span>
          </div>
        </div>

        {status && (
          <div className="mt-4 p-3 bg-white rounded border">
            <h4 className="font-medium mb-2">详细状态</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Provider: {status.hasProvider ? '✅' : '❌'}</div>
              <div>Signer: {status.hasSigner ? '✅' : '❌'}</div>
              <div>FHEVM实例: {status.hasFhevmInstance ? '✅' : '❌'}</div>
              <div>合约地址: {status.contracts ? '✅' : '❌'}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleRefreshStatus}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          刷新状态
        </button>
      </div>

      {/* 错误显示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">错误</span>
          </div>
          <p className="mt-1 text-red-700">{error}</p>
        </div>
      )}

      {/* 初始化配置 */}
      {!isInitialized && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">初始化 FHEVM 服务</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RPC URL
              </label>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                placeholder="http://localhost:8545"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                私钥
              </label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="请输入私钥"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleInitialize}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '初始化中...' : '初始化 FHEVM'}
            </button>
          </div>
        </div>
      )}

      {/* 合约地址配置 */}
      {isInitialized && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">合约地址配置</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                交易分析器地址
              </label>
              <input
                type="text"
                value={transactionAnalyzerAddress}
                onChange={(e) => setTransactionAnalyzerAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                隐私分析器地址
              </label>
              <input
                type="text"
                value={privateAnalyzerAddress}
                onChange={(e) => setPrivateAnalyzerAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                FHEVM 接口地址（IFHEVM）
              </label>
              <input
                type="text"
                value={fhevmInterfaceAddress}
                onChange={(e) => setFhevmInterfaceAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              onClick={handleSetContracts}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '设置中...' : '设置合约地址'}
            </button>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          重置服务
        </button>

        {isInitialized && (
          <button
            onClick={() => window.open('/api/fhevm/health', '_blank')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            健康检查
          </button>
        )}
      </div>

      {/* 使用说明 */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">使用说明</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 首先需要部署FHEVM网络和智能合约</li>
          <li>• 确保RPC URL指向正确的FHEVM节点</li>
          <li>• 私钥用于签名FHEVM操作</li>
          <li>• 合约地址需要在部署后填入</li>
          <li>• 初始化成功后即可使用隐私保护功能</li>
        </ul>
      </div>
    </div>
  );
};
