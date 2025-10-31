import { useState, useEffect, useCallback } from 'react';
import { fhevmService, FHEVMStatus, EncryptedTransactionData, FHEVMAnalysisResult } from '../services/fhevm';

export interface UseFHEVMReturn {
  // 状态
  isInitialized: boolean;
  status: FHEVMStatus | null;
  isLoading: boolean;
  error: string | null;
  
  // 方法
  initialize: (rpcUrl: string, privateKey: string) => Promise<boolean>;
  encryptTransactionData: (transactionData: {
    amount: string;
    gasUsed: string;
    timestamp: number;
  }) => Promise<EncryptedTransactionData | null>;
  encryptTransactionBatch: (transactions: Array<{
    amount: string;
    gasUsed: string;
    timestamp: number;
  }>) => Promise<EncryptedTransactionData[] | null>;
  performPrivateRiskAnalysis: (encryptedTransactions: EncryptedTransactionData[]) => Promise<FHEVMAnalysisResult | null>;
  performPrivatePatternAnalysis: (encryptedTransactions: EncryptedTransactionData[]) => Promise<FHEVMAnalysisResult | null>;
  decryptResult: (encryptedResult: string) => Promise<number | null>;
  setContractAddresses: (transactionAnalyzerAddress: string, privateAnalyzerAddress: string, fhevmInterfaceAddress: string) => Promise<boolean>;
  reset: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  healthCheck: () => Promise<boolean>;
}

export function useFHEVM(): UseFHEVMReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<FHEVMStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 刷新状态
  const refreshStatus = useCallback(async () => {
    try {
      const newStatus = await fhevmService.getStatus();
      setStatus(newStatus);
      setIsInitialized(newStatus?.isInitialized || false);
    } catch (err) {
      console.error('刷新FHEVM状态失败:', err);
      setError('刷新状态失败');
    }
  }, []);

  // 初始化FHEVM
  const initialize = useCallback(async (rpcUrl: string, privateKey: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await fhevmService.initialize(rpcUrl, privateKey);
      setIsInitialized(success);
      
      if (success) {
        await refreshStatus();
      } else {
        setError('FHEVM初始化失败');
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'FHEVM初始化失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStatus]);

  // 加密交易数据
  const encryptTransactionData = useCallback(async (transactionData: {
    amount: string;
    gasUsed: string;
    timestamp: number;
  }): Promise<EncryptedTransactionData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fhevmService.encryptTransactionData(transactionData);
      if (!result) {
        setError('数据加密失败');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '数据加密失败';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 批量加密交易数据
  const encryptTransactionBatch = useCallback(async (transactions: Array<{
    amount: string;
    gasUsed: string;
    timestamp: number;
  }>): Promise<EncryptedTransactionData[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fhevmService.encryptTransactionBatch(transactions);
      if (!result) {
        setError('批量加密失败');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '批量加密失败';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 执行隐私保护的风险分析
  const performPrivateRiskAnalysis = useCallback(async (encryptedTransactions: EncryptedTransactionData[]): Promise<FHEVMAnalysisResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fhevmService.performPrivateRiskAnalysis(encryptedTransactions);
      if (!result) {
        setError('FHEVM风险分析失败');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'FHEVM风险分析失败';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 执行隐私保护的模式分析
  const performPrivatePatternAnalysis = useCallback(async (encryptedTransactions: EncryptedTransactionData[]): Promise<FHEVMAnalysisResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fhevmService.performPrivatePatternAnalysis(encryptedTransactions);
      if (!result) {
        setError('FHEVM模式分析失败');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'FHEVM模式分析失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 解密FHEVM结果
  const decryptResult = useCallback(async (encryptedResult: string): Promise<number | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fhevmService.decryptResult(encryptedResult);
      if (result === null) {
        setError('解密失败');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '解密失败';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 设置合约地址
  const setContractAddresses = useCallback(async (transactionAnalyzerAddress: string, privateAnalyzerAddress: string, fhevmInterfaceAddress: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await fhevmService.setContractAddresses(transactionAnalyzerAddress, privateAnalyzerAddress, fhevmInterfaceAddress);
      if (!success) {
        setError('设置合约地址失败');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '设置合约地址失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 重置FHEVM服务
  const reset = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await fhevmService.reset();
      setIsInitialized(false);
      setStatus(null);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '重置FHEVM服务失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 健康检查
  const healthCheck = useCallback(async (): Promise<boolean> => {
    try {
      return await fhevmService.healthCheck();
    } catch (err) {
      console.error('FHEVM健康检查失败:', err);
      return false;
    }
  }, []);

  // 组件挂载时刷新状态
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    // 状态
    isInitialized,
    status,
    isLoading,
    error,
    
    // 方法
    initialize,
    encryptTransactionData,
    encryptTransactionBatch,
    performPrivateRiskAnalysis,
    performPrivatePatternAnalysis,
    decryptResult,
    setContractAddresses,
    reset,
    refreshStatus,
    healthCheck,
  };
}
