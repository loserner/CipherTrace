// FHEVM前端服务
import { ethers } from 'ethers';

export interface EncryptedTransactionData {
  dataId: string;
  encrypted: boolean;
  meta?: {
    timestamp?: number;
  };
}

export interface FHEVMAnalysisResult {
  analysisId: string;
  isCompleted?: boolean;
  timestamp: number;
  encryptedResult?: string | null;
  // 兼容旧字段（可能不存在）
  riskScore?: number;
  patternScore?: number;
  isHighRisk?: boolean;
  isMediumRisk?: boolean;
  isLowRisk?: boolean;
  hasSuspiciousPattern?: boolean;
  hasUnusualPattern?: boolean;
  hasNormalPattern?: boolean;
}

export interface FHEVMStatus {
  isInitialized: boolean;
  hasProvider: boolean;
  hasSigner: boolean;
  hasFhevmInstance: boolean;
  contracts: {
    transactionAnalyzer?: string;
    privateAnalyzer?: string;
  };
}

class FHEVMService {
  private baseUrl: string;
  private isInitialized: boolean = false;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  }

  /**
   * 初始化FHEVM服务
   * @param rpcUrl RPC URL
   * @param privateKey 私钥
   */
  async initialize(rpcUrl: string, privateKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/fhevm/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rpcUrl, privateKey }),
      });

      const data = await response.json();
      
      if (data.success) {
        this.isInitialized = true;
        console.log('✅ FHEVM服务初始化成功');
        return true;
      } else {
        console.error('❌ FHEVM服务初始化失败:', data.message);
        return false;
      }
    } catch (error) {
      console.error('FHEVM初始化错误:', error);
      return false;
    }
  }

  /**
   * 获取FHEVM状态
   */
  async getStatus(): Promise<FHEVMStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/fhevm/status`);
      const data = await response.json();
      
      if (data.success) {
        return data.status;
      }
      return null;
    } catch (error) {
      console.error('获取FHEVM状态错误:', error);
      return null;
    }
  }

  /**
   * 加密交易数据
   * @param transactionData 交易数据
   */
  async encryptTransactionData(transactionData: {
    amount: string;
    gasUsed: string;
    timestamp: number;
  }): Promise<EncryptedTransactionData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/fhevm/encrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionData }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.encryptedData as EncryptedTransactionData;
      } else {
        console.error('数据加密失败:', data.message);
        return null;
      }
    } catch (error) {
      console.error('数据加密错误:', error);
      return null;
    }
  }

  /**
   * 批量加密交易数据
   * @param transactions 交易数据数组
   */
  async encryptTransactionBatch(transactions: Array<{
    amount: string;
    gasUsed: string;
    timestamp: number;
  }>): Promise<EncryptedTransactionData[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/fhevm/encrypt-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.encryptedTransactions as EncryptedTransactionData[];
      } else {
        console.error('批量加密失败:', data.message);
        return null;
      }
    } catch (error) {
      console.error('批量加密错误:', error);
      return null;
    }
  }

  /**
   * 执行隐私保护的风险分析
   * @param encryptedTransactions 加密的交易数据
   */
  async performPrivateRiskAnalysis(
    encryptedTransactions: EncryptedTransactionData[]
  ): Promise<FHEVMAnalysisResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/fhevm/analyze-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ encryptedTransactions }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.analysisResult as FHEVMAnalysisResult;
      } else {
        console.error('FHEVM风险分析失败:', data.message);
        return null;
      }
    } catch (error) {
      console.error('FHEVM风险分析错误:', error);
      return null;
    }
  }

  /**
   * 执行隐私保护的模式分析
   * @param encryptedTransactions 加密的交易数据
   */
  async performPrivatePatternAnalysis(
    encryptedTransactions: EncryptedTransactionData[]
  ): Promise<FHEVMAnalysisResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/fhevm/analyze-pattern`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ encryptedTransactions }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.analysisResult as FHEVMAnalysisResult;
      } else {
        console.error('FHEVM模式分析失败:', data.message);
        return null;
      }
    } catch (error) {
      console.error('FHEVM模式分析错误:', error);
      return null;
    }
  }

  /**
   * 解密FHEVM结果（当前后端已不返回密文，保留接口以兼容旧逻辑）
   * @param encryptedResult 加密的结果
   */
  async decryptResult(encryptedResult: string): Promise<number | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/fhevm/decrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ encryptedResult }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.decryptedResult;
      } else {
        console.error('解密失败:', data.message);
        return null;
      }
    } catch (error) {
      console.error('解密错误:', error);
      return null;
    }
  }

  /**
   * 设置合约地址
   * @param transactionAnalyzerAddress 交易分析器地址
   * @param privateAnalyzerAddress 隐私分析器地址
   */
  async setContractAddresses(
    transactionAnalyzerAddress: string,
    privateAnalyzerAddress: string,
    fhevmInterfaceAddress: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/fhevm/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionAnalyzerAddress,
          privateAnalyzerAddress,
          fhevmInterfaceAddress,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ 合约地址设置成功');
        return true;
      } else {
        console.error('❌ 合约地址设置失败:', data.message);
        return false;
      }
    } catch (error) {
      console.error('设置合约地址错误:', error);
      return false;
    }
  }

  /**
   * 重置FHEVM服务
   */
  async reset(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/fhevm/reset`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        this.isInitialized = false;
        console.log('🔄 FHEVM服务已重置');
        return true;
      } else {
        console.error('❌ 重置FHEVM服务失败:', data.message);
        return false;
      }
    } catch (error) {
      console.error('重置FHEVM服务错误:', error);
      return false;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/fhevm/health`);
      const data = await response.json();
      
      return data.success && data.healthy;
    } catch (error) {
      console.error('FHEVM健康检查错误:', error);
      return false;
    }
  }

  /**
   * 检查是否已初始化
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

// 创建单例实例
export const fhevmService = new FHEVMService();

// 将服务暴露到全局，方便调试
if (typeof window !== 'undefined') {
  (window as any).fhevmService = fhevmService;
}
