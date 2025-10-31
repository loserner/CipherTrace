import express from 'express';
import { ethers } from 'ethers';
const router = express.Router();

// 模拟数据存储
let riskAssessments = {};
let riskAlerts = [];

// 获取风险评估
router.get('/assessment', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: '无效的钱包地址'
      });
    }

    // 模拟获取风险评估
    const assessment = generateMockRiskAssessment(address);
    
    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('获取风险评估失败:', error);
    res.status(500).json({
      success: false,
      message: '获取风险评估失败'
    });
  }
});

// 获取风险历史
router.get('/history', async (req, res) => {
  try {
    const { address, days = 7 } = req.query;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: '无效的钱包地址'
      });
    }

    // 模拟获取风险历史
    const history = generateMockRiskHistory(address, parseInt(days));
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('获取风险历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取风险历史失败'
    });
  }
});

// 获取风险警报
router.get('/alerts', async (req, res) => {
  try {
    const { address } = req.query;
    
    // 模拟获取风险警报
    const alerts = generateMockRiskAlerts(address);
    
    res.json({
      success: true,
      data: {
        alerts
      }
    });
  } catch (error) {
    console.error('获取风险警报失败:', error);
    res.status(500).json({
      success: false,
      message: '获取风险警报失败'
    });
  }
});

// 创建风险警报
router.post('/alerts', async (req, res) => {
  try {
    const { type, message, severity, address, transactionHash } = req.body;
    
    const alert = {
      id: Date.now(),
      type: type || 'info',
      message: message || '风险警报',
      severity: severity || 'medium',
      address: address || null,
      transactionHash: transactionHash || null,
      timestamp: Date.now(),
      isRead: false
    };

    riskAlerts.push(alert);
    
    res.json({
      success: true,
      data: alert,
      message: '风险警报创建成功'
    });
  } catch (error) {
    console.error('创建风险警报失败:', error);
    res.status(500).json({
      success: false,
      message: '创建风险警报失败'
    });
  }
});

// 标记警报为已读
router.put('/alerts/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = riskAlerts.find(a => a.id === parseInt(id));
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: '未找到该警报'
      });
    }

    alert.isRead = true;
    
    res.json({
      success: true,
      message: '警报已标记为已读'
    });
  } catch (error) {
    console.error('标记警报失败:', error);
    res.status(500).json({
      success: false,
      message: '标记警报失败'
    });
  }
});

// 获取风险趋势
router.get('/trends', async (req, res) => {
  try {
    const { address, period = '7d' } = req.query;
    
    // 模拟获取风险趋势
    const trends = generateMockRiskTrends(address, period);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('获取风险趋势失败:', error);
    res.status(500).json({
      success: false,
      message: '获取风险趋势失败'
    });
  }
});

// 生成模拟风险评估
function generateMockRiskAssessment(address) {
  const overallScore = Math.floor(Math.random() * 100);
  const riskLevel = overallScore < 40 ? 'low' : overallScore < 70 ? 'medium' : 'high';
  
  return {
    address: address.toLowerCase(),
    overallScore,
    riskLevel,
    riskFactors: [
      {
        name: '交易频率',
        score: Math.floor(Math.random() * 100),
        status: Math.random() > 0.5 ? 'good' : 'warning',
        description: '交易频率分析',
        weight: 0.2
      },
      {
        name: '大额交易',
        score: Math.floor(Math.random() * 100),
        status: Math.random() > 0.5 ? 'good' : 'danger',
        description: '大额交易风险评估',
        weight: 0.3
      },
      {
        name: 'Gas使用',
        score: Math.floor(Math.random() * 100),
        status: Math.random() > 0.5 ? 'good' : 'warning',
        description: 'Gas使用效率分析',
        weight: 0.15
      },
      {
        name: '交互合约',
        score: Math.floor(Math.random() * 100),
        status: Math.random() > 0.5 ? 'good' : 'danger',
        description: '智能合约交互风险',
        weight: 0.25
      },
      {
        name: '时间模式',
        score: Math.floor(Math.random() * 100),
        status: Math.random() > 0.5 ? 'good' : 'warning',
        description: '交易时间模式分析',
        weight: 0.1
      }
    ],
    recentAlerts: generateMockRiskAlerts(address).slice(0, 3),
    trend: {
      current: overallScore,
      previous: Math.max(0, overallScore + Math.floor(Math.random() * 20) - 10),
      weeklyAverage: Math.max(0, overallScore + Math.floor(Math.random() * 15) - 7),
      monthlyAverage: Math.max(0, overallScore + Math.floor(Math.random() * 10) - 5),
      change: Math.floor(Math.random() * 20) - 10,
      changePercent: (Math.random() * 20 - 10).toFixed(1)
    },
    lastUpdated: Date.now()
  };
}

// 生成模拟风险历史
function generateMockRiskHistory(address, days) {
  const history = [];
  const now = Date.now();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - (i * 24 * 60 * 60 * 1000));
    history.push({
      date: date.toISOString().split('T')[0],
      riskScore: Math.floor(Math.random() * 100),
      riskLevel: Math.random() > 0.5 ? 'low' : Math.random() > 0.3 ? 'medium' : 'high',
      transactionCount: Math.floor(Math.random() * 50) + 5,
      riskTransactions: Math.floor(Math.random() * 10) + 1
    });
  }
  
  return history;
}

// 生成模拟风险警报
function generateMockRiskAlerts(address) {
  const alerts = [];
  const alertTypes = ['warning', 'info', 'danger'];
  const alertMessages = [
    '检测到与高风险合约的交互',
    '交易频率异常，建议检查',
    '大额交易检测',
    '异常Gas使用模式',
    '可疑交易时间模式',
    '与已知诈骗地址交互'
  ];
  
  for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
    alerts.push({
      id: Date.now() + i,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      address: address || null,
      transactionHash: Math.random() > 0.5 ? `0x${Math.random().toString(16).substr(2, 64)}` : null,
      timestamp: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000),
      isRead: Math.random() > 0.5
    });
  }
  
  return alerts.sort((a, b) => b.timestamp - a.timestamp);
}

// 生成模拟风险趋势
function generateMockRiskTrends(address, period) {
  const trends = [];
  const now = Date.now();
  let interval = 24 * 60 * 60 * 1000; // 1天
  let points = 7; // 7个数据点
  
  if (period === '1d') {
    interval = 60 * 60 * 1000; // 1小时
    points = 24;
  } else if (period === '30d') {
    interval = 24 * 60 * 60 * 1000; // 1天
    points = 30;
  }
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now - (i * interval);
    trends.push({
      timestamp,
      riskScore: Math.floor(Math.random() * 100),
      transactionCount: Math.floor(Math.random() * 20) + 1,
      riskTransactions: Math.floor(Math.random() * 5) + 1
    });
  }
  
  return trends;
}

export default router;
