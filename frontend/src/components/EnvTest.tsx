import React, { useState, useEffect } from 'react';

export const EnvTest: React.FC = () => {
  const [envVars, setEnvVars] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 获取所有环境变量
    const allEnvVars = import.meta.env;
    const viteEnvVars = Object.keys(allEnvVars)
      .filter(key => key.startsWith('VITE_'))
      .reduce((obj, key) => {
        obj[key] = allEnvVars[key];
        return obj;
      }, {} as any);

    setEnvVars(viteEnvVars);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">环境变量测试</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">所有VITE环境变量:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Etherscan API Key状态:</h3>
          <div className="space-y-2">
            <div>
              <strong>VITE_ETHERSCAN_API_KEY:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                envVars.VITE_ETHERSCAN_API_KEY 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {envVars.VITE_ETHERSCAN_API_KEY ? '已配置' : '未配置'}
              </span>
            </div>
            {envVars.VITE_ETHERSCAN_API_KEY && (
              <div>
                <strong>API Key长度:</strong> {envVars.VITE_ETHERSCAN_API_KEY.length}
              </div>
            )}
            {envVars.VITE_ETHERSCAN_API_KEY && (
              <div>
                <strong>API Key前缀:</strong> {envVars.VITE_ETHERSCAN_API_KEY.substring(0, 8)}...
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded">
          <h3 className="font-semibold mb-2">其他重要环境变量:</h3>
          <div className="space-y-1">
            <div>
              <strong>VITE_API_BASE_URL:</strong> {envVars.VITE_API_BASE_URL || '未配置'}
            </div>
            <div>
              <strong>VITE_RPC_URL_MAINNET:</strong> {envVars.VITE_RPC_URL_MAINNET ? '已配置' : '未配置'}
            </div>
            <div>
              <strong>VITE_RPC_URL_SEPOLIA:</strong> {envVars.VITE_RPC_URL_SEPOLIA ? '已配置' : '未配置'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
