import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { ethers } from 'ethers';
import fhevmService from '../src/services/fhevm.js';

/**
 * FHEVM功能测试
 */
describe('FHEVM Tests', function() {
  this.timeout(30000); // 30秒超时

  let provider;
  let signer;
  let privateAnalyzer;
  let transactionAnalyzer;

  before(async function() {
    console.log('🔧 设置测试环境...');
    
    // 初始化FHEVM服务
    const rpcUrl = process.env.FHEVM_RPC_URL || 'http://localhost:8545';
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('请设置 PRIVATE_KEY 环境变量');
    }

    // 初始化FHEVM服务
    const initialized = await fhevmService.initialize(rpcUrl, privateKey);
    expect(initialized).to.be.true;

    // 创建provider和signer
    provider = new ethers.JsonRpcProvider(rpcUrl);
    signer = new ethers.Wallet(privateKey, provider);

    // 检查网络连接
    const network = await provider.getNetwork();
    console.log('🌐 测试网络:', network.name, 'Chain ID:', network.chainId.toString());
  });

  after(async function() {
    console.log('🧹 清理测试环境...');
    fhevmService.reset();
  });

  describe('FHEVM服务初始化', function() {
    it('应该成功初始化FHEVM服务', async function() {
      const status = fhevmService.getStatus();
      expect(status.isInitialized).to.be.true;
      expect(status.hasProvider).to.be.true;
      expect(status.hasSigner).to.be.true;
    });

    it('应该能够进行健康检查', async function() {
      const isHealthy = await fhevmService.healthCheck();
      expect(isHealthy).to.be.true;
    });
  });

  describe('数据加密功能', function() {
    it('应该能够加密单个交易数据', async function() {
      const transactionData = {
        amount: '1.5',
        gasUsed: '21000',
        timestamp: Date.now()
      };

      const encryptedData = await fhevmService.encryptTransactionData(transactionData);
      expect(encryptedData).to.not.be.null;
      expect(encryptedData.originalData).to.deep.equal(transactionData);
      expect(encryptedData.encryptedAmount).to.be.a('string');
      expect(encryptedData.encryptedGasUsed).to.be.a('string');
      expect(encryptedData.encryptedTimestamp).to.be.a('string');
    });

    it('应该能够批量加密交易数据', async function() {
      const transactions = [
        {
          amount: '1.0',
          gasUsed: '21000',
          timestamp: Date.now()
        },
        {
          amount: '2.0',
          gasUsed: '25000',
          timestamp: Date.now() + 1000
        }
      ];

      const encryptedTransactions = await fhevmService.encryptTransactionBatch(transactions);
      expect(encryptedTransactions).to.not.be.null;
      expect(encryptedTransactions).to.have.length(2);
      
      encryptedTransactions.forEach((encrypted, index) => {
        expect(encrypted.originalData).to.deep.equal(transactions[index]);
        expect(encrypted.encryptedAmount).to.be.a('string');
      });
    });
  });

  describe('隐私保护分析功能', function() {
    let encryptedTransactions;

    before(async function() {
      // 准备测试数据
      const transactions = [
        {
          amount: '1.0',
          gasUsed: '21000',
          timestamp: Date.now()
        },
        {
          amount: '2.0',
          gasUsed: '25000',
          timestamp: Date.now() + 1000
        },
        {
          amount: '0.5',
          gasUsed: '20000',
          timestamp: Date.now() + 2000
        }
      ];

      encryptedTransactions = await fhevmService.encryptTransactionBatch(transactions);
      expect(encryptedTransactions).to.not.be.null;
    });

    it('应该能够执行隐私保护的风险分析', async function() {
      const analysisResult = await fhevmService.performPrivateRiskAnalysis(encryptedTransactions);
      expect(analysisResult).to.not.be.null;
      expect(analysisResult.analysisId).to.be.a('string');
      expect(analysisResult.timestamp).to.be.a('number');
      expect(analysisResult.encryptedResult).to.be.a('string');
      
      // 检查风险等级
      expect(analysisResult.isHighRisk || analysisResult.isMediumRisk || analysisResult.isLowRisk).to.be.true;
    });

    it('应该能够执行隐私保护的模式分析', async function() {
      const analysisResult = await fhevmService.performPrivatePatternAnalysis(encryptedTransactions);
      expect(analysisResult).to.not.be.null;
      expect(analysisResult.analysisId).to.be.a('string');
      expect(analysisResult.timestamp).to.be.a('number');
      expect(analysisResult.encryptedResult).to.be.a('string');
      
      // 检查模式类型
      expect(analysisResult.hasSuspiciousPattern || analysisResult.hasUnusualPattern || analysisResult.hasNormalPattern).to.be.true;
    });
  });

  describe('解密功能', function() {
    it('应该能够解密FHEVM结果', async function() {
      // 先加密一个简单值
      const testValue = 42;
      const encryptedValue = await fhevmService.encryptTransactionData({
        amount: testValue.toString(),
        gasUsed: '21000',
        timestamp: Date.now()
      });

      // 解密结果
      const decryptedValue = await fhevmService.decryptResult(encryptedValue.encryptedAmount);
      expect(decryptedValue).to.not.be.null;
      expect(decryptedValue).to.be.a('number');
    });
  });

  describe('合约地址设置', function() {
    it('应该能够设置合约地址', async function() {
      const transactionAnalyzerAddress = '0x1234567890123456789012345678901234567890';
      const privateAnalyzerAddress = '0x0987654321098765432109876543210987654321';

      const success = await fhevmService.setContractAddresses(
        transactionAnalyzerAddress,
        privateAnalyzerAddress
      );

      expect(success).to.be.true;

      const status = fhevmService.getStatus();
      expect(status.contracts.transactionAnalyzer).to.equal(transactionAnalyzerAddress);
      expect(status.contracts.privateAnalyzer).to.equal(privateAnalyzerAddress);
    });
  });

  describe('错误处理', function() {
    it('应该正确处理无效的RPC URL', async function() {
      const originalReset = fhevmService.reset;
      fhevmService.reset();

      const success = await fhevmService.initialize('http://invalid-url:8545', '0x123');
      expect(success).to.be.false;

      // 恢复原始状态
      fhevmService.reset = originalReset;
    });

    it('应该正确处理无效的私钥', async function() {
      fhevmService.reset();

      const success = await fhevmService.initialize('http://localhost:8545', 'invalid-key');
      expect(success).to.be.false;
    });

    it('应该正确处理空交易数据', async function() {
      const result = await fhevmService.encryptTransactionBatch([]);
      expect(result).to.be.null;
    });

    it('应该正确处理无效的分析数据', async function() {
      const result = await fhevmService.performPrivateRiskAnalysis([]);
      expect(result).to.be.null;
    });
  });

  describe('性能测试', function() {
    it('应该能够处理大量交易数据', async function() {
      const startTime = Date.now();
      
      // 创建100笔测试交易
      const transactions = Array.from({ length: 100 }, (_, i) => ({
        amount: (i + 1).toString(),
        gasUsed: (21000 + i * 100).toString(),
        timestamp: Date.now() + i * 1000
      }));

      const encryptedTransactions = await fhevmService.encryptTransactionBatch(transactions);
      const endTime = Date.now();

      expect(encryptedTransactions).to.not.be.null;
      expect(encryptedTransactions).to.have.length(100);
      
      const processingTime = endTime - startTime;
      console.log(`⏱️  处理100笔交易耗时: ${processingTime}ms`);
      
      // 性能要求：100笔交易应该在10秒内完成
      expect(processingTime).to.be.lessThan(10000);
    });
  });
});
