import express from 'express';
import { ethers } from 'ethers';
const router = express.Router();

// 模拟数据存储
let trackedWallets = [];
let walletActivities = [];

// 获取钱包信息
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: '无效的钱包地址'
      });
    }

    // 模拟获取钱包信息
    const walletInfo = generateMockWalletInfo(address);
    
    res.json({
      success: true,
      data: walletInfo
    });
  } catch (error) {
    console.error('获取钱包信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取钱包信息失败'
    });
  }
});

// 添加钱包追踪
router.post('/track', async (req, res) => {
  try {
    const { address, label } = req.body;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: '无效的钱包地址'
      });
    }

    // 检查是否已经追踪
    const existingWallet = trackedWallets.find(w => w.address.toLowerCase() === address.toLowerCase());
    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: '该钱包已被追踪'
      });
    }

    // 添加追踪钱包
    const newWallet = {
      id: Date.now(),
      address: address.toLowerCase(),
      label: label || `钱包 ${address.slice(0, 8)}...`,
      balance: (Math.random() * 100).toFixed(4),
      token: 'ETH',
      riskScore: Math.floor(Math.random() * 100),
      riskLevel: Math.random() > 0.5 ? 'low' : Math.random() > 0.3 ? 'medium' : 'high',
      lastActivity: Date.now(),
      transactionCount: Math.floor(Math.random() * 500) + 10,
      isWhale: Math.random() > 0.8,
      isTracked: true,
      createdAt: Date.now()
    };

    trackedWallets.push(newWallet);
    
    res.json({
      success: true,
      data: newWallet,
      message: '钱包添加成功'
    });
  } catch (error) {
    console.error('添加钱包追踪失败:', error);
    res.status(500).json({
      success: false,
      message: '添加钱包追踪失败'
    });
  }
});

// 移除钱包追踪
router.delete('/track', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: '无效的钱包地址'
      });
    }

    // 查找并移除钱包
    const walletIndex = trackedWallets.findIndex(w => w.address.toLowerCase() === address.toLowerCase());
    if (walletIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '未找到该追踪钱包'
      });
    }

    trackedWallets.splice(walletIndex, 1);
    
    res.json({
      success: true,
      message: '钱包移除成功'
    });
  } catch (error) {
    console.error('移除钱包追踪失败:', error);
    res.status(500).json({
      success: false,
      message: '移除钱包追踪失败'
    });
  }
});

// 获取追踪的钱包列表
router.get('/tracked/list', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        wallets: trackedWallets
      }
    });
  } catch (error) {
    console.error('获取追踪钱包列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取追踪钱包列表失败'
    });
  }
});

// 获取钱包活动
router.get('/:address/activities', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 20 } = req.query;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: '无效的钱包地址'
      });
    }

    // 模拟获取钱包活动
    const activities = generateMockActivities(address, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        activities
      }
    });
  } catch (error) {
    console.error('获取钱包活动失败:', error);
    res.status(500).json({
      success: false,
      message: '获取钱包活动失败'
    });
  }
});

// 获取钱包统计
router.get('/:address/stats', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: '无效的钱包地址'
      });
    }

    // 模拟获取钱包统计
    const stats = generateMockWalletStats(address);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取钱包统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取钱包统计失败'
    });
  }
});

// 生成模拟钱包信息
function generateMockWalletInfo(address) {
  const riskScore = Math.floor(Math.random() * 100);
  const riskLevel = riskScore < 40 ? 'low' : riskScore < 70 ? 'medium' : 'high';
  
  return {
    address: address.toLowerCase(),
    balance: (Math.random() * 1000).toFixed(4),
    token: 'ETH',
    riskScore,
    riskLevel,
    transactionCount: Math.floor(Math.random() * 1000) + 50,
    firstTransaction: Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000),
    lastActivity: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000),
    isWhale: Math.random() > 0.9,
    tags: generateRandomTags(),
    riskFactors: generateRiskFactors(riskScore)
  };
}

// 生成模拟钱包活动
function generateMockActivities(address, limit) {
  const activities = [];
  const now = Date.now();
  
  for (let i = 0; i < limit; i++) {
    const activity = {
      id: Date.now() + i,
      wallet: address.toLowerCase(),
      action: ['send', 'receive', 'swap', 'approve'][Math.floor(Math.random() * 4)],
      amount: (Math.random() * 10).toFixed(4),
      token: 'ETH',
      to: Math.random() > 0.5 ? `0x${Math.random().toString(16).substr(2, 40)}` : undefined,
      from: Math.random() > 0.5 ? `0x${Math.random().toString(16).substr(2, 40)}` : undefined,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: now - (i * 3600000), // 每小时一个活动
      riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      gasUsed: Math.floor(Math.random() * 200000) + 21000,
      gasPrice: Math.floor(Math.random() * 50) + 10
    };
    activities.push(activity);
  }
  
  return activities;
}

// 生成模拟钱包统计
function generateMockWalletStats(address) {
  return {
    totalTransactions: Math.floor(Math.random() * 2000) + 100,
    totalVolume: (Math.random() * 5000 + 500).toFixed(2),
    averageTransactionValue: (Math.random() * 10 + 1).toFixed(4),
    riskTransactions: Math.floor(Math.random() * 100) + 10,
    successRate: (Math.random() * 15 + 85).toFixed(1),
    dailyStats: generateDailyStats()
  };
}

// 生成每日统计
function generateDailyStats() {
  const stats = [];
  const now = Date.now();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - (i * 24 * 60 * 60 * 1000));
    stats.push({
      date: date.toISOString().split('T')[0],
      transactions: Math.floor(Math.random() * 50) + 5,
      volume: (Math.random() * 100 + 10).toFixed(2),
      riskScore: Math.floor(Math.random() * 100)
    });
  }
  
  return stats;
}

// 生成随机标签
function generateRandomTags() {
  const tags = ['活跃', '巨鲸', 'DeFi用户', 'NFT交易者', '套利者', '矿工', '交易所'];
  const selectedTags = [];
  const numTags = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < numTags; i++) {
    const tag = tags[Math.floor(Math.random() * tags.length)];
    if (!selectedTags.includes(tag)) {
      selectedTags.push(tag);
    }
  }
  
  return selectedTags;
}

// 生成风险因素
function generateRiskFactors(riskScore) {
  const factors = [];
  
  if (riskScore > 80) {
    factors.push('频繁大额交易');
  }
  if (riskScore > 60) {
    factors.push('异常交易模式');
  }
  if (riskScore > 40) {
    factors.push('与高风险地址交互');
  }
  
  return factors;
}

export default router;
