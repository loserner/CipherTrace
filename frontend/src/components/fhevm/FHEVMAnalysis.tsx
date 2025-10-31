import React, { useState, useEffect } from 'react';
import { useFHEVM } from '../../hooks/useFHEVM';
import { Shield, Lock, Eye, EyeOff, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import { Transaction } from '../../types';

interface FHEVMAnalysisProps {
  transactions: Transaction[];
  onAnalysisComplete?: (result: any) => void;
}

export const FHEVMAnalysis: React.FC<FHEVMAnalysisProps> = ({ 
  transactions, 
  onAnalysisComplete 
}) => {
  const {
    isInitialized,
    isLoading,
    error,
    encryptTransactionBatch,
    performPrivateRiskAnalysis,
    performPrivatePatternAnalysis,
    decryptResult
  } = useFHEVM();

  const [encryptedTransactions, setEncryptedTransactions] = useState<any[]>([]);
  const [riskAnalysisResult, setRiskAnalysisResult] = useState<any>(null);
  const [patternAnalysisResult, setPatternAnalysisResult] = useState<any>(null);
  const [showDecryptedResults, setShowDecryptedResults] = useState(false);
  const [decryptedRiskScore, setDecryptedRiskScore] = useState<number | null>(null);
  const [decryptedPatternScore, setDecryptedPatternScore] = useState<number | null>(null);

  // 加密交易数据
  const handleEncryptTransactions = async () => {
    if (transactions.length === 0) {
      alert('没有交易数据可加密');
      return;
    }

    const transactionData = transactions.map(tx => ({
      amount: tx.value,
      gasUsed: tx.gasUsed,
      timestamp: tx.timestamp
    }));

    const encrypted = await encryptTransactionBatch(transactionData);
    if (encrypted) {
      setEncryptedTransactions(encrypted);
      console.log('✅ 交易数据加密成功');
    }
  };

  // 执行风险分析
  const handleRiskAnalysis = async () => {
    if (encryptedTransactions.length === 0) {
      alert('请先加密交易数据');
      return;
    }

    const result = await performPrivateRiskAnalysis(encryptedTransactions);
    if (result) {
      setRiskAnalysisResult(result);
      console.log('✅ FHEVM风险分析完成');
      
      if (onAnalysisComplete) {
        onAnalysisComplete({ type: 'risk', result });
      }
    }
  };

  // 执行模式分析
  const handlePatternAnalysis = async () => {
    if (encryptedTransactions.length < 2) {
      alert('模式分析至少需要2笔交易');
      return;
    }

    const result = await performPrivatePatternAnalysis(encryptedTransactions);
    if (result) {
      setPatternAnalysisResult(result);
      console.log('✅ FHEVM模式分析完成');
      
      if (onAnalysisComplete) {
        onAnalysisComplete({ type: 'pattern', result });
      }
    }
  };

  // 解密结果（如果返回了密文才尝试解密）
  const handleDecryptResults = async () => {
    if (riskAnalysisResult?.encryptedResult) {
      const riskScore = await decryptResult(riskAnalysisResult.encryptedResult);
      setDecryptedRiskScore(riskScore);
    }

    if (patternAnalysisResult?.encryptedResult) {
      const patternScore = await decryptResult(patternAnalysisResult.encryptedResult);
      setDecryptedPatternScore(patternScore);
    }

    setShowDecryptedResults(true);
  };

  // 重置分析结果
  const handleReset = () => {
    setEncryptedTransactions([]);
    setRiskAnalysisResult(null);
    setPatternAnalysisResult(null);
    setShowDecryptedResults(false);
    setDecryptedRiskScore(null);
    setDecryptedPatternScore(null);
  };

  if (!isInitialized) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">FHEVM 未初始化</span>
        </div>
        <p className="mt-2 text-yellow-700">
          请先配置 FHEVM 服务以使用隐私保护分析功能。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">FHEVM 隐私分析</h2>
      </div>

      {/* 错误显示 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">错误</span>
          </div>
          <p className="mt-1 text-red-700">{error}</p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleEncryptTransactions}
          disabled={isLoading || transactions.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Lock className="w-4 h-4" />
          {isLoading ? '加密中...' : `加密 ${transactions.length} 笔交易`}
        </button>

        <button
          onClick={handleRiskAnalysis}
          disabled={isLoading || encryptedTransactions.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          {isLoading ? '分析中...' : '风险分析'}
        </button>

        <button
          onClick={handlePatternAnalysis}
          disabled={isLoading || encryptedTransactions.length < 2}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          {isLoading ? '分析中...' : '模式分析'}
        </button>

        <button
          onClick={handleDecryptResults}
          disabled={isLoading || (!riskAnalysisResult && !patternAnalysisResult)}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {showDecryptedResults ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isLoading ? '解密中...' : showDecryptedResults ? '隐藏结果' : '解密结果'}
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          重置
        </button>
      </div>

      {/* 加密状态 */}
      {encryptedTransactions.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">数据已加密</span>
          </div>
          <p className="mt-1 text-green-700">
            成功加密 {encryptedTransactions.length} 笔交易数据
          </p>
        </div>
      )}

      {/* 风险分析结果 */}
      {riskAnalysisResult && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">风险分析结果</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700">分析ID</p>
              <p className="font-mono text-xs break-all">{riskAnalysisResult.analysisId}</p>
            </div>
            
            <div>
              <p className="text-sm text-blue-700">时间戳</p>
              <p className="text-sm">{new Date(riskAnalysisResult.timestamp).toLocaleString()}</p>
            </div>
          </div>

          {/* 兼容旧字段的等级徽章展示（若后端不返回则不显示）*/}
          {(riskAnalysisResult.isHighRisk || riskAnalysisResult.isMediumRisk || riskAnalysisResult.isLowRisk) && (
            <div className="mt-4">
              <p className="text-sm text-blue-700 mb-2">风险等级</p>
              <div className="flex items-center gap-2">
                {riskAnalysisResult.isHighRisk && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">高风险</span>
                )}
                {riskAnalysisResult.isMediumRisk && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">中风险</span>
                )}
                {riskAnalysisResult.isLowRisk && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">低风险</span>
                )}
              </div>
            </div>
          )}

          {showDecryptedResults && decryptedRiskScore !== null && (
            <div className="mt-4 p-3 bg-white rounded border">
              <p className="text-sm text-blue-700 mb-1">解密后的风险评分</p>
              <p className="text-2xl font-bold text-blue-900">{decryptedRiskScore.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}

      {/* 模式分析结果 */}
      {patternAnalysisResult && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">模式分析结果</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-purple-700">分析ID</p>
              <p className="font-mono text-xs break-all">{patternAnalysisResult.analysisId}</p>
            </div>
            
            <div>
              <p className="text-sm text-purple-700">时间戳</p>
              <p className="text-sm">{new Date(patternAnalysisResult.timestamp).toLocaleString()}</p>
            </div>
          </div>

          {(patternAnalysisResult.hasSuspiciousPattern || patternAnalysisResult.hasUnusualPattern || patternAnalysisResult.hasNormalPattern) && (
            <div className="mt-4">
              <p className="text-sm text-purple-700 mb-2">模式类型</p>
              <div className="flex items-center gap-2">
                {patternAnalysisResult.hasSuspiciousPattern && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">可疑模式</span>
                )}
                {patternAnalysisResult.hasUnusualPattern && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">异常模式</span>
                )}
                {patternAnalysisResult.hasNormalPattern && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">正常模式</span>
                )}
              </div>
            </div>
          )}

          {showDecryptedResults && decryptedPatternScore !== null && (
            <div className="mt-4 p-3 bg-white rounded border">
              <p className="text-sm text-purple-700 mb-1">解密后的模式评分</p>
              <p className="text-2xl font-bold text-purple-900">{decryptedPatternScore.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}

      {/* 使用说明 */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">隐私保护说明</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• 所有交易数据在分析前都会被同态加密</li>
          <li>• 分析过程在加密数据上进行，不会暴露原始数据</li>
          <li>• 只有授权用户才能解密分析结果</li>
          <li>• 支持风险分析和模式分析两种隐私保护分析</li>
        </ul>
      </div>
    </div>
  );
};
