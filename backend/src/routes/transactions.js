import express from 'express';
import { ethers } from 'ethers';
const router = express.Router();

// 模拟数据存储（实际应用中应该使用数据库）
let transactions = [];
let transactionStats = {};

// 获取交易历史
router.get('/', async (req, res) => {
  try {
    const { address } = req.query;
    const limit = 200; // 固定返回最新100条
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: '缺少钱包地址参数'
      });
    }

    // 验证地址格式
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: '无效的钱包地址'
      });
    }

    // 模拟获取交易数据
    const mockTransactions = generateMockTransactions(address, limit);
    
    res.json({
      success: true,
      data: {
        transactions: mockTransactions,
        pagination: {
          page: 1,
          limit: limit,
          total: mockTransactions.length,
          totalPages: 1
        }
      }
    });
  } catch (error) {
    console.error('获取交易历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取交易历史失败'
    });
  }
});

// 获取交易详情
router.get('/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    
    // 验证交易哈希格式
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return res.status(400).json({
        success: false,
        message: '无效的交易哈希'
      });
    }

    // 模拟获取交易详情
    const transaction = generateMockTransaction(txHash);
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('获取交易详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取交易详情失败'
    });
  }
});

// 分析交易风险
router.post('/:txHash/analyze', async (req, res) => {
  try {
    const { txHash } = req.params;
    
    // 验证交易哈希格式
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return res.status(400).json({
        success: false,
        message: '无效的交易哈希'
      });
    }

    // 模拟风险分析
    const analysis = await analyzeTransactionRisk(txHash);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('分析交易风险失败:', error);
    res.status(500).json({
      success: false,
      message: '分析交易风险失败'
    });
  }
});

// 获取交易统计
router.get('/stats/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: '无效的钱包地址'
      });
    }

    // 模拟获取统计数据
    const stats = generateMockStats(address);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取交易统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取交易统计失败'
    });
  }
});

// 生成模拟交易数据
function generateMockTransactions(address, limit) {
  const transactions = [];
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = 0; i < limit; i++) {
    const tx = generateMockTransaction(
      `0x${Math.random().toString(16).substr(2, 64)}`,
      address
    );
    tx.timestamp = now - (i * 3600); // 每小时一笔交易
    transactions.push(tx);
  }
  
  return transactions;
}

// 生成模拟交易
function generateMockTransaction(txHash, fromAddress) {
  const riskScore = Math.floor(Math.random() * 100);
  const riskLevel = riskScore < 40 ? 'low' : riskScore < 70 ? 'medium' : 'high';
  
  return {
    hash: txHash,
    from: fromAddress,
    to: `0x${Math.random().toString(16).substr(2, 40)}`,
    value: (Math.random() * 10).toFixed(4),
    token: 'ETH',
    gasUsed: Math.floor(Math.random() * 200000) + 21000,
    gasPrice: Math.floor(Math.random() * 50) + 10,
    timestamp: Math.floor(Date.now() / 1000),
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    status: Math.random() > 0.1 ? 'success' : 'pending',
    riskScore,
    riskLevel,
    riskFactors: generateRiskFactors(riskScore)
  };
}

// 生成风险因素
function generateRiskFactors(riskScore) {
  const factors = [];
  
  if (riskScore > 80) {
    factors.push('大额交易');
  }
  if (riskScore > 60) {
    factors.push('高Gas使用');
  }
  if (riskScore > 40) {
    factors.push('异常时间');
  }
  
  return factors;
}

// 生成模拟统计数据
function generateMockStats(address) {
  return {
    totalTransactions: Math.floor(Math.random() * 1000) + 100,
    totalVolume: (Math.random() * 1000 + 100).toFixed(2),
    averageGasPrice: (Math.random() * 30 + 10).toFixed(2),
    riskTransactions: Math.floor(Math.random() * 50) + 10,
    successRate: (Math.random() * 20 + 80).toFixed(1)
  };
}

// 分析交易风险
async function analyzeTransactionRisk(txHash) {
  // 模拟风险分析逻辑
  const riskScore = Math.floor(Math.random() * 100);
  const riskLevel = riskScore < 40 ? 'low' : riskScore < 70 ? 'medium' : 'high';
  
  return {
    riskScore,
    riskLevel,
    riskFactors: generateRiskFactors(riskScore),
    analysis: {
      gasEfficiency: Math.random() > 0.5 ? 'good' : 'poor',
      timing: Math.random() > 0.5 ? 'normal' : 'suspicious',
      amount: Math.random() > 0.5 ? 'normal' : 'large',
      contractInteraction: Math.random() > 0.5 ? 'safe' : 'risky'
    },
    recommendations: riskScore > 70 ? [
      '建议仔细检查交易详情',
      '考虑降低交易金额',
      '确认接收地址正确'
    ] : riskScore > 40 ? [
      '交易风险中等，请谨慎操作'
    ] : [
      '交易风险较低，可以安全执行'
    ]
  };
}

export default router;
