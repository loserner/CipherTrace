import express from 'express';
const router = express.Router();

// 获取分析数据
router.get('/overview', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // 模拟获取分析概览数据
    const overview = generateMockAnalyticsOverview(period);
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('获取分析概览失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分析概览失败'
    });
  }
});

// 获取交易趋势
router.get('/transactions/trend', async (req, res) => {
  try {
    const { period = '7d', address } = req.query;
    
    // 模拟获取交易趋势数据
    const trend = generateMockTransactionTrend(period, address);
    
    res.json({
      success: true,
      data: trend
    });
  } catch (error) {
    console.error('获取交易趋势失败:', error);
    res.status(500).json({
      success: false,
      message: '获取交易趋势失败'
    });
  }
});

// 获取风险分析
router.get('/risk/analysis', async (req, res) => {
  try {
    const { period = '7d', address } = req.query;
    
    // 模拟获取风险分析数据
    const analysis = generateMockRiskAnalysis(period, address);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('获取风险分析失败:', error);
    res.status(500).json({
      success: false,
      message: '获取风险分析失败'
    });
  }
});

// 获取代币分析
router.get('/tokens/analysis', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // 模拟获取代币分析数据
    const analysis = generateMockTokenAnalysis(period);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('获取代币分析失败:', error);
    res.status(500).json({
      success: false,
      message: '获取代币分析失败'
    });
  }
});

// 获取用户行为分析
router.get('/user/behavior', async (req, res) => {
  try {
    const { address, period = '7d' } = req.query;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: '缺少钱包地址参数'
      });
    }
    
    // 模拟获取用户行为分析数据
    const behavior = generateMockUserBehavior(address, period);
    
    res.json({
      success: true,
      data: behavior
    });
  } catch (error) {
    console.error('获取用户行为分析失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户行为分析失败'
    });
  }
});

// 生成模拟分析概览
function generateMockAnalyticsOverview(period) {
  const now = Date.now();
  const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 7;
  
  return {
    totalTransactions: Math.floor(Math.random() * 10000) + 1000,
    totalVolume: (Math.random() * 1000000 + 100000).toFixed(2),
    averageRiskScore: Math.floor(Math.random() * 100),
    riskTransactions: Math.floor(Math.random() * 1000) + 100,
    activeWallets: Math.floor(Math.random() * 5000) + 500,
    newWallets: Math.floor(Math.random() * 1000) + 100,
    period,
    lastUpdated: now,
    trends: {
      transactions: (Math.random() * 20 - 10).toFixed(1),
      volume: (Math.random() * 20 - 10).toFixed(1),
      riskScore: (Math.random() * 20 - 10).toFixed(1),
      activeWallets: (Math.random() * 20 - 10).toFixed(1)
    }
  };
}

// 生成模拟交易趋势
function generateMockTransactionTrend(period, address) {
  const trend = [];
  const now = Date.now();
  let interval = 24 * 60 * 60 * 1000; // 1天
  let points = 7;
  
  if (period === '1d') {
    interval = 60 * 60 * 1000; // 1小时
    points = 24;
  } else if (period === '30d') {
    interval = 24 * 60 * 60 * 1000; // 1天
    points = 30;
  }
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now - (i * interval);
    trend.push({
      timestamp,
      transactions: Math.floor(Math.random() * 100) + 10,
      volume: (Math.random() * 1000 + 100).toFixed(2),
      riskScore: Math.floor(Math.random() * 100),
      uniqueWallets: Math.floor(Math.random() * 50) + 5
    });
  }
  
  return {
    period,
    address: address || null,
    data: trend,
    summary: {
      totalTransactions: trend.reduce((sum, item) => sum + item.transactions, 0),
      totalVolume: trend.reduce((sum, item) => sum + parseFloat(item.volume), 0).toFixed(2),
      averageRiskScore: Math.floor(trend.reduce((sum, item) => sum + item.riskScore, 0) / trend.length),
      peakTransactions: Math.max(...trend.map(item => item.transactions)),
      peakVolume: Math.max(...trend.map(item => parseFloat(item.volume))).toFixed(2)
    }
  };
}

// 生成模拟风险分析
function generateMockRiskAnalysis(period, address) {
  return {
    period,
    address: address || null,
    riskDistribution: {
      low: Math.floor(Math.random() * 50) + 30,
      medium: Math.floor(Math.random() * 30) + 20,
      high: Math.floor(Math.random() * 20) + 5
    },
    riskFactors: [
      {
        name: '大额交易',
        count: Math.floor(Math.random() * 100) + 10,
        percentage: (Math.random() * 30 + 10).toFixed(1),
        trend: (Math.random() * 20 - 10).toFixed(1)
      },
      {
        name: '异常Gas使用',
        count: Math.floor(Math.random() * 50) + 5,
        percentage: (Math.random() * 20 + 5).toFixed(1),
        trend: (Math.random() * 20 - 10).toFixed(1)
      },
      {
        name: '可疑合约交互',
        count: Math.floor(Math.random() * 30) + 3,
        percentage: (Math.random() * 15 + 3).toFixed(1),
        trend: (Math.random() * 20 - 10).toFixed(1)
      },
      {
        name: '时间模式异常',
        count: Math.floor(Math.random() * 40) + 8,
        percentage: (Math.random() * 25 + 8).toFixed(1),
        trend: (Math.random() * 20 - 10).toFixed(1)
      }
    ],
    alerts: {
      total: Math.floor(Math.random() * 50) + 10,
      unread: Math.floor(Math.random() * 10) + 1,
      critical: Math.floor(Math.random() * 5) + 1
    }
  };
}

// 生成模拟代币分析
function generateMockTokenAnalysis(period) {
  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', volume: (Math.random() * 1000000 + 500000).toFixed(2) },
    { symbol: 'USDT', name: 'Tether USD', volume: (Math.random() * 800000 + 400000).toFixed(2) },
    { symbol: 'USDC', name: 'USD Coin', volume: (Math.random() * 600000 + 300000).toFixed(2) },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', volume: (Math.random() * 400000 + 200000).toFixed(2) },
    { symbol: 'DAI', name: 'Dai Stablecoin', volume: (Math.random() * 300000 + 150000).toFixed(2) }
  ];
  
  return {
    period,
    topTokens: tokens.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume)),
    totalTokens: Math.floor(Math.random() * 1000) + 100,
    newTokens: Math.floor(Math.random() * 50) + 10,
    volumeDistribution: tokens.map(token => ({
      symbol: token.symbol,
      percentage: (parseFloat(token.volume) / tokens.reduce((sum, t) => sum + parseFloat(t.volume), 0) * 100).toFixed(1)
    }))
  };
}

// 生成模拟用户行为分析
function generateMockUserBehavior(address, period) {
  return {
    address: address.toLowerCase(),
    period,
    activity: {
      totalTransactions: Math.floor(Math.random() * 1000) + 100,
      dailyAverage: Math.floor(Math.random() * 20) + 5,
      peakHour: Math.floor(Math.random() * 24),
      mostActiveDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][Math.floor(Math.random() * 7)]
    },
    patterns: {
      transactionFrequency: Math.random() > 0.5 ? 'high' : 'medium',
      riskTolerance: Math.random() > 0.5 ? 'high' : 'low',
      preferredTokens: ['ETH', 'USDT', 'USDC'].slice(0, Math.floor(Math.random() * 3) + 1),
      tradingStyle: ['day_trader', 'swing_trader', 'hodler', 'arbitrageur'][Math.floor(Math.random() * 4)]
    },
    insights: [
      '用户倾向于在白天进行交易',
      '主要交易ETH和稳定币',
      '风险承受能力较高',
      '交易频率适中'
    ]
  };
}

export default router;
