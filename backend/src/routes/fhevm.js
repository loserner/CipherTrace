import express from 'express';
import fhevmService from '../services/fhevm.js';
import { ethers } from 'ethers';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const IFHEVMArtifact = require('../../artifacts/contracts/IFHEVM.sol/IFHEVM.json');
const FHEVMPrivateAnalyzerArtifact = require('../../artifacts/contracts/FHEVMPrivateAnalyzer.sol/FHEVMPrivateAnalyzer.json');

const router = express.Router();

/**
 * @route POST /api/fhevm/initialize
 * @desc 初始化FHEVM服务
 */
router.post('/initialize', async (req, res) => {
  try {
    const { rpcUrl, privateKey } = req.body;
    
    if (!rpcUrl || !privateKey) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: rpcUrl, privateKey'
      });
    }

    const success = await fhevmService.initialize(rpcUrl, privateKey);
    
    if (success) {
      res.json({
        success: true,
        message: 'FHEVM服务初始化成功',
        status: fhevmService.getStatus()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'FHEVM服务初始化失败'
      });
    }
  } catch (error) {
    console.error('FHEVM初始化错误:', error);
    res.status(500).json({
      success: false,
      message: 'FHEVM初始化失败',
      error: error.message
    });
  }
});

/**
 * @route GET /api/fhevm/status
 * @desc 获取FHEVM服务状态
 */
router.get('/status', (req, res) => {
  try {
    const status = fhevmService.getStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('获取FHEVM状态错误:', error);
    res.status(500).json({
      success: false,
      message: '获取FHEVM状态失败',
      error: error.message
    });
  }
});

/**
 * @route POST /api/fhevm/encrypt
 * @desc 加密交易数据
 */
router.post('/encrypt', async (req, res) => {
  try {
    const { transactionData } = req.body;
    
    if (!transactionData) {
      return res.status(400).json({
        success: false,
        message: '缺少交易数据'
      });
    }

    const encrypted = await fhevmService.encryptTransactionData(transactionData);

    res.json({
      success: true,
      message: '数据加密成功',
      encryptedData: encrypted
    });
  } catch (error) {
    console.error('数据加密错误:', error);
    res.status(500).json({
      success: false,
      message: '数据加密失败',
      error: error.message
    });
  }
});

/**
 * @route POST /api/fhevm/encrypt-batch
 * @desc 批量加密交易数据
 */
router.post('/encrypt-batch', async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        message: '缺少交易数据数组'
      });
    }

    if (transactions.length > 100) {
      return res.status(400).json({
        success: false,
        message: '批量加密最多支持100笔交易'
      });
    }

    const encrypted = await fhevmService.encryptTransactionBatch(transactions);

    res.json({
      success: true,
      message: `成功加密 ${encrypted.length} 笔交易`,
      encryptedTransactions: encrypted
    });
  } catch (error) {
    console.error('批量加密错误:', error);
    res.status(500).json({
      success: false,
      message: '批量加密失败',
      error: error.message
    });
  }
});

/**
 * @route POST /api/fhevm/analyze-risk
 * @desc 执行隐私保护的风险分析
 */
router.post('/analyze-risk', async (req, res) => {
  try {
    const { encryptedTransactions } = req.body;
    
    if (!encryptedTransactions || !Array.isArray(encryptedTransactions)) {
      return res.status(400).json({
        success: false,
        message: '缺少加密交易数据'
      });
    }

    if (encryptedTransactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: '至少需要1笔交易进行分析'
      });
    }

    // 适配：后端现在期望 dataId 列表
    const dataIds = encryptedTransactions.map((e) => e.dataId || e);
    const analysisResult = await fhevmService.performPrivateRiskAnalysis(dataIds);
    
    res.json({
      success: true,
      message: 'FHEVM风险分析完成',
      analysisResult
    });
  } catch (error) {
    console.error('FHEVM风险分析错误:', error);
    res.status(500).json({
      success: false,
      message: 'FHEVM风险分析失败',
      error: error.message
    });
  }
});

/**
 * @route POST /api/fhevm/analyze-pattern
 * @desc 执行隐私保护的模式分析
 */
router.post('/analyze-pattern', async (req, res) => {
  try {
    const { encryptedTransactions } = req.body;
    
    if (!encryptedTransactions || !Array.isArray(encryptedTransactions)) {
      return res.status(400).json({
        success: false,
        message: '缺少加密交易数据'
      });
    }

    if (encryptedTransactions.length < 2) {
      return res.status(400).json({
        success: false,
        message: '模式分析至少需要2笔交易'
      });
    }

    const dataIds = encryptedTransactions.map((e) => e.dataId || e);
    const analysisResult = await fhevmService.performPrivatePatternAnalysis(dataIds);
    
    res.json({
      success: true,
      message: 'FHEVM模式分析完成',
      analysisResult
    });
  } catch (error) {
    console.error('FHEVM模式分析错误:', error);
    res.status(500).json({
      success: false,
      message: 'FHEVM模式分析失败',
      error: error.message
    });
  }
});

/**
 * @route POST /api/fhevm/decrypt
 * @desc 解密FHEVM结果
 */
router.post('/decrypt', async (req, res) => {
  try {
    const { encryptedResult } = req.body;
    
    if (!encryptedResult) {
      return res.status(400).json({
        success: false,
        message: '缺少加密结果'
      });
    }

    const decryptedResult = await fhevmService.decryptResult(encryptedResult);
    
    res.json({
      success: true,
      message: '解密成功',
      decryptedResult
    });
  } catch (error) {
    console.error('解密错误:', error);
    res.status(500).json({
      success: false,
      message: '解密失败',
      error: error.message
    });
  }
});

/**
 * @route POST /api/fhevm/contracts
 * @desc 设置合约地址
 */
router.post('/contracts', (req, res) => {
  try {
    const { transactionAnalyzerAddress, privateAnalyzerAddress, fhevmInterfaceAddress } = req.body;
    
    if (!transactionAnalyzerAddress || !privateAnalyzerAddress || !fhevmInterfaceAddress) {
      return res.status(400).json({
        success: false,
        message: '缺少合约地址（需要 transactionAnalyzerAddress, privateAnalyzerAddress, fhevmInterfaceAddress）'
      });
    }

    // 验证地址格式
    if (
      !ethers.isAddress(transactionAnalyzerAddress) ||
      !ethers.isAddress(privateAnalyzerAddress) ||
      !ethers.isAddress(fhevmInterfaceAddress)
    ) {
      return res.status(400).json({
        success: false,
        message: '无效的合约地址格式'
      });
    }

    // 设置地址并初始化合约实例
    fhevmService.setContractAddresses(
      transactionAnalyzerAddress,
      privateAnalyzerAddress,
      fhevmInterfaceAddress
    );

    const contractABIs = {
      IFHEVM: IFHEVMArtifact.abi,
      FHEVMPrivateAnalyzer: FHEVMPrivateAnalyzerArtifact.abi,
    };

    fhevmService.initializeContracts(contractABIs)
      .then(() => {
        res.json({
          success: true,
          message: '合约地址设置并初始化成功',
          contracts: {
            transactionAnalyzer: transactionAnalyzerAddress,
            privateAnalyzer: privateAnalyzerAddress,
            fhevmInterface: fhevmInterfaceAddress
          }
        });
      })
      .catch((initError) => {
        console.error('初始化合约实例失败:', initError);
        res.status(500).json({
          success: false,
          message: '合约地址设置成功，但初始化失败',
          error: initError.message
        });
      });
  } catch (error) {
    console.error('设置合约地址错误:', error);
    res.status(500).json({
      success: false,
      message: '设置合约地址失败',
      error: error.message
    });
  }
});

/**
 * @route POST /api/fhevm/reset
 * @desc 重置FHEVM服务
 */
router.post('/reset', (req, res) => {
  try {
    fhevmService.reset();
    
    res.json({
      success: true,
      message: 'FHEVM服务已重置'
    });
  } catch (error) {
    console.error('重置FHEVM服务错误:', error);
    res.status(500).json({
      success: false,
      message: '重置FHEVM服务失败',
      error: error.message
    });
  }
});

/**
 * @route GET /api/fhevm/health
 * @desc FHEVM健康检查
 */
router.get('/health', (req, res) => {
  try {
    const status = fhevmService.getStatus();
    const isHealthy = status.isInitialized && status.hasProvider && status.hasSigner;
    
    res.json({
      success: true,
      healthy: isHealthy,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('FHEVM健康检查错误:', error);
    res.status(500).json({
      success: false,
      healthy: false,
      message: 'FHEVM健康检查失败',
      error: error.message
    });
  }
});

export default router;
