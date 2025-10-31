import { useState } from 'react'
import { Eye, Plus, Trash2, Search, AlertTriangle, TrendingUp, Users } from 'lucide-react'
import { formatAddress, formatTime, formatNumber } from '../utils/format'

export function WalletTracker() {
  const [newAddress, setNewAddress] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // 模拟追踪的钱包数据
  const trackedWallets = [
    {
      id: 1,
      address: '0x1234567890abcdef1234567890abcdef12345678',
      label: '主要钱包',
      balance: '12.5',
      token: 'ETH',
      riskScore: 25,
      riskLevel: 'low',
      lastActivity: Date.now() - 3600000,
      transactionCount: 156,
      isWhale: false
    },
    {
      id: 2,
      address: '0x2345678901bcdef1234567890abcdef1234567890',
      label: '交易钱包',
      balance: '0.8',
      token: 'ETH',
      riskScore: 65,
      riskLevel: 'medium',
      lastActivity: Date.now() - 7200000,
      transactionCount: 89,
      isWhale: false
    },
    {
      id: 3,
      address: '0x3456789012cdef1234567890abcdef12345678901',
      label: '巨鲸钱包',
      balance: '1250.3',
      token: 'ETH',
      riskScore: 45,
      riskLevel: 'low',
      lastActivity: Date.now() - 86400000,
      transactionCount: 23,
      isWhale: true
    },
  ]

  const recentActivities = [
    {
      wallet: '0x1234...5678',
      action: '发送',
      amount: '1.5 ETH',
      to: '0xabcd...efgh',
      timestamp: Date.now() - 1800000,
      riskLevel: 'low'
    },
    {
      wallet: '0x2345...7890',
      action: '接收',
      amount: '0.3 ETH',
      from: '0xijkl...mnop',
      timestamp: Date.now() - 3600000,
      riskLevel: 'medium'
    },
    {
      wallet: '0x3456...8901',
      action: '大额转账',
      amount: '100 ETH',
      to: '0xqrst...uvwx',
      timestamp: Date.now() - 7200000,
      riskLevel: 'high'
    },
  ]

  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'badge badge-success'
      case 'medium':
        return 'badge badge-warning'
      case 'high':
        return 'badge badge-danger'
      default:
        return 'badge badge-secondary'
    }
  }

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return '低风险'
      case 'medium':
        return '中风险'
      case 'high':
        return '高风险'
      default:
        return '未知'
    }
  }

  const handleAddWallet = () => {
    if (!newAddress) return
    // 这里应该调用API添加钱包
    console.log('添加钱包:', newAddress)
    setNewAddress('')
  }

  const handleRemoveWallet = (id: number) => {
    // 这里应该调用API移除钱包
    console.log('移除钱包:', id)
  }

  const filteredWallets = trackedWallets.filter(wallet =>
    wallet.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">钱包追踪</h1>
        <p className="text-secondary-600 mt-1">
          监控特定钱包地址的活动和风险状况
        </p>
      </div>

      {/* 添加钱包 */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="label">钱包地址</label>
              <input
                type="text"
                placeholder="输入要追踪的钱包地址..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddWallet}
                disabled={!newAddress}
                className="btn btn-primary btn-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加追踪
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">追踪钱包数</p>
                <p className="text-2xl font-bold text-secondary-900">{trackedWallets.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">巨鲸钱包</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {trackedWallets.filter(w => w.isWhale).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">高风险钱包</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {trackedWallets.filter(w => w.riskLevel === 'high').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-danger-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-danger-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">总交易数</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {trackedWallets.reduce((sum, w) => sum + w.transactionCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 钱包列表 */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title">追踪的钱包</h3>
              <p className="card-description">管理您正在监控的钱包地址</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="搜索钱包..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {filteredWallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-secondary-900">{wallet.label}</h4>
                      {wallet.isWhale && (
                        <span className="badge badge-warning">巨鲸</span>
                      )}
                    </div>
                    <p className="text-sm text-secondary-600 font-mono">
                      {formatAddress(wallet.address)}
                    </p>
                    <p className="text-xs text-secondary-500">
                      余额: {formatNumber(wallet.balance)} {wallet.token} | 
                      交易数: {wallet.transactionCount} | 
                      最后活动: {formatTime(Math.floor(wallet.lastActivity / 1000))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${getRiskBadgeClass(wallet.riskLevel)}`}>
                        {getRiskText(wallet.riskLevel)}
                      </span>
                      <span className="text-sm text-secondary-600">
                        {wallet.riskScore}/100
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveWallet(wallet.id)}
                    className="p-2 text-secondary-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    title="移除追踪"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">最近活动</h3>
          <p className="card-description">追踪钱包的最新交易活动</p>
        </div>
        <div className="card-content">
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">
                      {activity.wallet} {activity.action} {activity.amount}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {activity.action === '发送' ? '发送至' : '来自'} {activity.to || activity.from}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${getRiskBadgeClass(activity.riskLevel)}`}>
                    {getRiskText(activity.riskLevel)}
                  </span>
                  <span className="text-xs text-secondary-500">
                    {formatTime(Math.floor(activity.timestamp / 1000))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
