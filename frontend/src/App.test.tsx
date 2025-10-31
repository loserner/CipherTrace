import React from 'react'

// 简单的测试组件，用于验证基本渲染
function TestApp() {
  console.log('TestApp 渲染中...')
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          交易分析 DApp
        </h1>
        <p className="text-gray-600 mb-8">
          前端应用正在运行中...
        </p>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">系统状态</h2>
          <div className="space-y-2 text-left">
            <p>✅ React 组件渲染正常</p>
            <p>✅ Tailwind CSS 样式正常</p>
            <p>✅ 基本页面结构正常</p>
          </div>
        </div>
        <div className="mt-6">
          <button 
            onClick={() => alert('按钮点击正常！')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            测试按钮
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestApp
