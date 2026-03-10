'use client'

import { useState, useEffect } from 'react'

interface Stats {
  total: number
  today: number
  topPages: { page: string; views: number }[]
  period: number
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    fetch('/api/stats/views?type=summary&days=' + days)
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [days])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <a 
            href="/" 
            className="text-3xl font-bold hover:text-blue-600 transition-colors"
          >
            📊 数据统计
          </a>
          <a 
            href="/" 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← 返回主页
          </a>
        </div>
        
        <div className="mb-6">
          <select 
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            <option value={7}>最近7天</option>
            <option value={14}>最近14天</option>
            <option value={30}>最近30天</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{stats?.total || 0}</div>
            <div className="text-gray-500">总访问量</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-green-600">{stats?.today || 0}</div>
            <div className="text-gray-500">今日访问</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-purple-600">{stats?.topPages?.length || 0}</div>
            <div className="text-gray-500">热门页面</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-orange-600">{stats?.period || 0}</div>
            <div className="text-gray-500">统计天数</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">🔥 热门页面 TOP 10</h2>
          <div className="space-y-3">
            {stats?.topPages?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    idx < 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{item.page}</span>
                </div>
                <span className="text-gray-500">{item.views} 次</span>
              </div>
            ))}
            {(!stats?.topPages || stats.topPages.length === 0) && (
              <div className="text-center text-gray-400 py-8">暂无数据</div>
            )}
          </div>
        </div>

        <div className="mt-8 text-gray-400 text-sm">
          <p>• 数据来源：页面访问记录</p>
          <p>• 更新频率：实时</p>
        </div>
      </div>
    </div>
  )
}
