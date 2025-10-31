import React, { useState } from 'react'

const Settings = () => {
  const [settings, setSettings] = useState({
    riskThreshold: 'medium',
    notifications: true,
    autoRefresh: true,
    refreshInterval: '30',
    darkMode: false,
    language: 'zh-CN'
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          设置
        </h1>
        <p className="text-gray-600">
          配置您的交易分析偏好和系统设置
        </p>
      </div>

      <div className="space-y-8">
        {/* Risk Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">风险设置</h2>
          <div className="space-y-4">
            <div>
              <label className="label block mb-2">风险阈值</label>
              <select
                value={settings.riskThreshold}
                onChange={(e) => handleSettingChange('riskThreshold', e.target.value)}
                className="input"
              >
                <option value="low">低 - 只显示高风险交易</option>
                <option value="medium">中 - 显示中高风险交易</option>
                <option value="high">高 - 显示所有风险交易</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="label">启用风险通知</label>
                <p className="text-sm text-gray-500">当检测到高风险交易时发送通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">显示设置</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="label">自动刷新</label>
                <p className="text-sm text-gray-500">自动更新交易数据和风险分析</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.autoRefresh && (
              <div>
                <label className="label block mb-2">刷新间隔</label>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => handleSettingChange('refreshInterval', e.target.value)}
                  className="input"
                >
                  <option value="10">10秒</option>
                  <option value="30">30秒</option>
                  <option value="60">1分钟</option>
                  <option value="300">5分钟</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <label className="label">深色模式</label>
                <p className="text-sm text-gray-500">切换到深色主题</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">语言设置</h2>
          <div>
            <label className="label block mb-2">界面语言</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="input"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
              <option value="ko-KR">한국어</option>
            </select>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">账户设置</h2>
          <div className="space-y-4">
            <div>
              <label className="label block mb-2">钱包地址</label>
              <input
                type="text"
                value="0x1234...5678"
                disabled
                className="input bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">当前连接的钱包地址</p>
            </div>
            
            <div>
              <label className="label block mb-2">网络</label>
              <select className="input">
                <option>Ethereum Mainnet</option>
                <option>Polygon</option>
                <option>BSC</option>
                <option>Arbitrum</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">数据管理</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">导出数据</h3>
                <p className="text-sm text-gray-500">导出您的交易分析数据</p>
              </div>
              <button className="btn btn-outline btn-md">
                导出
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">清除缓存</h3>
                <p className="text-sm text-gray-500">清除本地缓存数据</p>
              </div>
              <button className="btn btn-outline btn-md">
                清除
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h3 className="font-medium text-red-900">重置设置</h3>
                <p className="text-sm text-red-600">将所有设置恢复为默认值</p>
              </div>
              <button className="btn btn-danger btn-md">
                重置
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="btn btn-primary btn-lg">
            保存设置
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings