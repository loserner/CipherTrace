import { ethers } from 'ethers';
import { createRequire } from 'module';

// 在 ESM 环境下通过 require 使用 SDK 的 Node 端导出（CJS），避免加载 web 入口
const require = createRequire(import.meta.url);
// 按照 @fhevm/sdk 的 exports: "./node": { "require": "./lib/node.cjs" }
const fhevmNode = require('@fhevm/sdk/node');
const { createInstance } = fhevmNode;

/**
 * FHEVM服务类
 * 提供同态加密和隐私保护计算功能
 * 支持与智能合约的集成
 */
class FHEVMService {
  constructor() {
    this.fhevmInstance = null;
    this.provider = null;
    this.signer = null;
    this.isInitialized = false;
    this.contracts = {};
    this.contractInstances = {};
    this.fhevmInterface = null;
    this.privateAnalyzer = null;
  }

  /**
   * 初始化FHEVM实例
   * @param {string} rpcUrl RPC URL
   * @param {string} privateKey 私钥
   */
  async initialize(rpcUrl, privateKey) {
    try {
      console.log('🔐 初始化FHEVM服务...');
      
      // 创建provider和signer
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.signer = new ethers.Wallet(privateKey, this.provider);
      
      // 创建FHEVM实例
      this.fhevmInstance = await createInstance({
        provider: this.provider,
        chainId: await this.provider.getNetwork().then(n => n.chainId),
      });
      
      this.isInitialized = true;
      console.log('✅ FHEVM服务初始化成功');
      
      return true;
    } catch (error) {
      console.error('❌ FHEVM服务初始化失败:', error);
      return false;
    }
  }

  /**
   * 设置合约地址
   * @param {string} transactionAnalyzerAddress 交易分析器地址
   * @param {string} privateAnalyzerAddress 隐私分析器地址
   * @param {string} fhevmInterfaceAddress FHEVM接口地址
   */
  setContractAddresses(transactionAnalyzerAddress, privateAnalyzerAddress, fhevmInterfaceAddress) {
    this.contracts.transactionAnalyzer = transactionAnalyzerAddress;
    this.contracts.privateAnalyzer = privateAnalyzerAddress;
    this.contracts.fhevmInterface = fhevmInterfaceAddress;
  }

  /**
   * 初始化合约实例
   * @param {Object} contractABIs 合约ABI对象
   */
  async initializeContracts(contractABIs) {
    if (!this.isInitialized) {
      throw new Error('FHEVM not initialized');
    }

    try {
      // 初始化FHEVM接口合约
      if (this.contracts.fhevmInterface && contractABIs.IFHEVM) {
        this.fhevmInterface = new ethers.Contract(
          this.contracts.fhevmInterface,
          contractABIs.IFHEVM,
          this.signer
        );
      }

      // 初始化隐私分析器合约
      if (this.contracts.privateAnalyzer && contractABIs.FHEVMPrivateAnalyzer) {
        this.privateAnalyzer = new ethers.Contract(
          this.contracts.privateAnalyzer,
          contractABIs.FHEVMPrivateAnalyzer,
          this.signer
        );
      }

      console.log('✅ 合约实例初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 合约实例初始化失败:', error);
      throw error;
    }
  }

  /**
   * 加密交易数据（使用智能合约）
   * @param {Object} transactionData 交易数据
   * @returns {Object} 加密后的数据
   */
  async encryptTransactionData(transactionData) {
    if (!this.isInitialized) {
      throw new Error('FHEVM not initialized');
    }

    if (!this.privateAnalyzer) {
      throw new Error('Private analyzer contract not initialized');
    }

    try {
      const { amount, gasUsed, timestamp } = transactionData;
      
      // 使用智能合约进行加密和存储
      const tx = await this.privateAnalyzer.storeEncryptedTransactionData(
        ethers.parseEther(amount.toString()),
        gasUsed,
        Math.floor(timestamp / 1000) // 转换为秒
      );
      
      const receipt = await tx.wait();
      const dataId = receipt.logs[0].args.dataId;
      
      return {
        dataId,
        originalData: transactionData,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('加密交易数据失败:', error);
      throw error;
    }
  }

  /**
   * 直接使用FHEVM SDK加密数据（不通过智能合约）
   * @param {Object} transactionData 交易数据
   * @returns {Object} 加密后的数据
   */
  async encryptTransactionDataDirect(transactionData) {
    if (!this.isInitialized) {
      throw new Error('FHEVM not initialized');
    }

    try {
      const { amount, gasUsed, timestamp } = transactionData;
      
      // 使用FHEVM SDK进行同态加密
      const encryptedAmount = await this.fhevmInstance.encrypt(amount);
      const encryptedGasUsed = await this.fhevmInstance.encrypt(gasUsed);
      const encryptedTimestamp = await this.fhevmInstance.encrypt(timestamp);
      
      return {
        encryptedAmount,
        encryptedGasUsed,
        encryptedTimestamp,
        originalData: transactionData
      };
    } catch (error) {
      console.error('直接加密交易数据失败:', error);
      throw error;
    }
  }

  /**
   * 批量加密交易数据
   * @param {Array} transactions 交易数据数组
   * @returns {Array} 加密后的数据数组
   */
  async encryptTransactionBatch(transactions) {
    if (!this.isInitialized) {
      throw new Error('FHEVM not initialized');
    }

    try {
      const encryptedTransactions = [];
      
      for (const transaction of transactions) {
        const encrypted = await this.encryptTransactionData(transaction);
        encryptedTransactions.push(encrypted);
      }
      
      return encryptedTransactions;
    } catch (error) {
      console.error('批量加密交易数据失败:', error);
      throw error;
    }
  }

  /**
   * 执行隐私保护的风险分析（使用智能合约）
   * @param {Array} dataIds 加密数据ID数组
   * @returns {Object} 分析结果
   */
  async performPrivateRiskAnalysis(dataIds) {
    if (!this.isInitialized) {
      throw new Error('FHEVM not initialized');
    }

    if (!this.privateAnalyzer) {
      throw new Error('Private analyzer contract not initialized');
    }

    try {
      console.log('🔍 执行FHEVM隐私风险分析...');
      
      // 调用智能合约进行风险分析
      const tx = await this.privateAnalyzer.performPrivateRiskAnalysis(dataIds);
      const receipt = await tx.wait();
      const analysisId = receipt.logs[0].args.analysisId;
      
      const result = {
        analysisId,
        transactionHash: tx.hash,
        status: 'pending',
        message: 'FHEVM analysis in progress',
        timestamp: Date.now()
      };
      
      console.log('✅ FHEVM风险分析请求已提交:', result);
      return result;
    } catch (error) {
      console.error('FHEVM风险分析失败:', error);
      throw error;
    }
  }

  /**
   * 检查分析结果
   * @param {string} analysisId 分析ID
   * @returns {Object} 分析结果
   */
  async getAnalysisResult(analysisId) {
    if (!this.privateAnalyzer) {
      throw new Error('Private analyzer contract not initialized');
    }

    try {
      const result = await this.privateAnalyzer.getAnalysisResult(analysisId);
      const isCompleted = await this.privateAnalyzer.isAnalysisCompleted(analysisId);
      
      return {
        analysisId,
        isCompleted,
        user: result.user,
        result: result.result,
        encryptedResult: result.encryptedResult,
        timestamp: result.timestamp
      };
    } catch (error) {
      console.error('获取分析结果失败:', error);
      throw error;
    }
  }

  /**
   * 处理FHEVM结果回调
   * @param {string} analysisId 分析ID
   * @returns {Object} 处理结果
   */
  async processFHEVMResult(analysisId) {
    if (!this.privateAnalyzer) {
      throw new Error('Private analyzer contract not initialized');
    }

    try {
      const tx = await this.privateAnalyzer.processFHEVMResult(analysisId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        analysisId
      };
    } catch (error) {
      console.error('处理FHEVM结果失败:', error);
      throw error;
    }
  }

  /**
   * 执行隐私保护的模式分析（使用智能合约）
   * @param {Array} dataIds 加密数据ID数组
   * @returns {Object} 模式分析结果
   */
  async performPrivatePatternAnalysis(dataIds) {
    if (!this.isInitialized) {
      throw new Error('FHEVM not initialized');
    }

    if (!this.privateAnalyzer) {
      throw new Error('Private analyzer contract not initialized');
    }

    try {
      console.log('🔍 执行FHEVM隐私模式分析...');
      
      if (dataIds.length < 2) {
        throw new Error('需要至少2笔交易进行模式分析');
      }
      
      // 调用智能合约进行模式分析
      const tx = await this.privateAnalyzer.performPrivatePatternAnalysis(dataIds);
      const receipt = await tx.wait();
      const analysisId = receipt.logs[0].args.analysisId;
      
      const result = {
        analysisId,
        transactionHash: tx.hash,
        status: 'pending',
        message: 'FHEVM pattern analysis in progress',
        timestamp: Date.now()
      };
      
      console.log('✅ FHEVM模式分析请求已提交:', result);
      return result;
    } catch (error) {
      console.error('FHEVM模式分析失败:', error);
      throw error;
    }
  }

  /**
   * 计算加密数据的风险评分
   * @param {Array} encryptedTransactions 加密的交易数据
   * @returns {number} 风险评分
   */
  async _calculateEncryptedRiskScore(encryptedTransactions) {
    // 这里是FHEVM同态加密计算的占位符
    // 实际实现需要使用FHEVM进行加密数据的计算
    
    let totalRisk = 0;
    let count = 0;
    
    for (const encryptedTx of encryptedTransactions) {
      // 模拟基于时间戳的风险评分计算
      const timeDiff = Date.now() - encryptedTx.originalData.timestamp;
      let riskScore = 0;
      
      if (timeDiff < 3600000) { // 1小时内
        riskScore = 20;
      } else if (timeDiff < 86400000) { // 1天内
        riskScore = 10;
      } else {
        riskScore = 5;
      }
      
      // 基于交易金额的风险评分
      const amount = parseFloat(encryptedTx.originalData.amount);
      if (amount > 100) {
        riskScore += 30;
      } else if (amount > 10) {
        riskScore += 15;
      }
      
      totalRisk += riskScore;
      count++;
    }
    
    return count > 0 ? Math.min(totalRisk / count, 100) : 0;
  }

  /**
   * 计算加密数据的模式评分
   * @param {Array} encryptedTransactions 加密的交易数据
   * @returns {number} 模式评分
   */
  async _calculateEncryptedPatternScore(encryptedTransactions) {
    // 这里是FHEVM模式分析的占位符
    // 实际实现需要使用FHEVM进行加密数据的模式识别
    
    let patternScore = 0;
    let count = 0;
    
    for (let i = 0; i < encryptedTransactions.length - 1; i++) {
      const tx1 = encryptedTransactions[i];
      const tx2 = encryptedTransactions[i + 1];
      
      const timeDiff = tx2.originalData.timestamp - tx1.originalData.timestamp;
      
      // 检测快速连续交易
      if (timeDiff < 300000) { // 5分钟内
        patternScore += 30;
      } else if (timeDiff < 3600000) { // 1小时内
        patternScore += 10;
      }
      
      // 检测相似金额交易
      const amount1 = parseFloat(tx1.originalData.amount);
      const amount2 = parseFloat(tx2.originalData.amount);
      const amountDiff = Math.abs(amount1 - amount2) / Math.max(amount1, amount2);
      
      if (amountDiff < 0.1) { // 金额差异小于10%
        patternScore += 20;
      }
      
      count++;
    }
    
    return count > 0 ? Math.min(patternScore / count, 100) : 0;
  }

  /**
   * 解密FHEVM结果
   * @param {string} encryptedResult 加密的结果
   * @returns {number} 解密后的结果
   */
  async decryptResult(encryptedResult) {
    if (!this.isInitialized) {
      throw new Error('FHEVM not initialized');
    }

    try {
      return await this.fhevmInstance.decrypt(encryptedResult);
    } catch (error) {
      console.error('解密FHEVM结果失败:', error);
      throw error;
    }
  }

  /**
   * 获取FHEVM状态
   * @returns {Object} FHEVM状态信息
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasProvider: !!this.provider,
      hasSigner: !!this.signer,
      hasFhevmInstance: !!this.fhevmInstance,
      hasContracts: !!this.privateAnalyzer && !!this.fhevmInterface,
      contracts: this.contracts
    };
  }

  /**
   * 获取FHEVM合约状态
   * @returns {Object} 合约状态信息
   */
  async getFHEVMStatus() {
    if (!this.privateAnalyzer) {
      throw new Error('Private analyzer contract not initialized');
    }

    try {
      const status = await this.privateAnalyzer.getFHEVMStatus();
      return {
        isConnected: status.isConnected,
        totalEncryptedData: status.totalEncryptedData,
        totalComputations: status.totalComputations,
        activeRequests: status.activeRequests
      };
    } catch (error) {
      console.error('获取FHEVM状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的分析历史
   * @param {string} userAddress 用户地址
   * @returns {Array} 分析ID数组
   */
  async getUserAnalyses(userAddress) {
    if (!this.privateAnalyzer) {
      throw new Error('Private analyzer contract not initialized');
    }

    try {
      return await this.privateAnalyzer.getUserAnalyses(userAddress);
    } catch (error) {
      console.error('获取用户分析历史失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的加密数据
   * @param {string} userAddress 用户地址
   * @returns {Array} 数据ID数组
   */
  async getUserEncryptedData(userAddress) {
    if (!this.privateAnalyzer) {
      throw new Error('Private analyzer contract not initialized');
    }

    try {
      return await this.privateAnalyzer.getUserEncryptedData(userAddress);
    } catch (error) {
      console.error('获取用户加密数据失败:', error);
      throw error;
    }
  }

  /**
   * 重置FHEVM实例
   */
  reset() {
    this.fhevmInstance = null;
    this.provider = null;
    this.signer = null;
    this.isInitialized = false;
    this.contracts = {};
    console.log('🔄 FHEVM服务已重置');
  }
}

// 创建单例实例
const fhevmService = new FHEVMService();

export default fhevmService;
