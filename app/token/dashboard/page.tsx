'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Wallet,
  Key,
  BarChart3,
  CreditCard,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Shield,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODkyOTIsImV4cCI6MjA4ODE2NTI5Mn0.xgQZ6v_EIvipDjufzcW-yo0JpS6yosplAPWNQIXzi14'

const supabase = createClient(supabaseUrl, supabaseKey)

const MOCK_USER = {
  email: 'guest@agent-skills.net.cn',
  balance: 5.00,
  total_spent: 0,
  api_key: 'sk-test-xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
}

// 模拟消费记录
const MOCK_RECORDS = [
  { id: 1, model: 'GPT-4o', tokens: 1200, cost: 0.24, date: '2026-05-15 10:23' },
  { id: 2, model: 'Claude-3.5', tokens: 800, cost: 0.16, date: '2026-05-15 09:45' },
  { id: 3, model: 'GPT-4o', tokens: 2000, cost: 0.40, date: '2026-05-14 22:10' },
]

// 模拟API Key列表
const MOCK_KEYS = [
  { id: 'key_1', name: '默认Key', key: 'sk-xxxx-xxxx-xxxx', created: '2026-05-10', status: 'active' },
]

type Tab = 'overview' | 'apikey' | 'usage' | 'topup'

export default function TokenDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [user, setUser] = useState<typeof MOCK_USER | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [showNewKey, setShowNewKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [keys, setKeys] = useState(MOCK_KEYS)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    // 模拟加载用户信息
    setTimeout(() => {
      setUser(MOCK_USER)
      setLoading(false)
    }, 800)
  }, [])

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const generateKey = () => {
    if (!newKeyName.trim()) return
    setCreating(true)
    setTimeout(() => {
      const newKey = {
        id: `key_${Date.now()}`,
        name: newKeyName,
        key: `sk-${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 8)}`,
        created: new Date().toISOString().split('T')[0],
        status: 'active',
      }
      setKeys([...keys, newKey])
      setNewKeyName('')
      setShowNewKey(false)
      setCreating(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* 顶部导航 */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/token" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
              <ArrowLeft className="w-4 h-4" />
              Token加油站
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🦐</span>
              <span className="font-bold">养虾池</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-400">{user?.email}</div>
            <div className="bg-slate-800 rounded-full px-3 py-1 text-sm">
              <span className="text-slate-400">余额 </span>
              <span className="text-cyan-400 font-bold">¥{user?.balance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">我的Token</h1>
          <p className="text-slate-400">管理API Key、查看用量、充值额度</p>
        </div>

        {/* Tab导航 */}
        <div className="flex gap-1 mb-8 bg-slate-900/60 p-1 rounded-xl w-fit border border-slate-800">
          {[
            { id: 'overview', label: '概览', icon: <Wallet className="w-4 h-4" /> },
            { id: 'apikey', label: 'API Key', icon: <Key className="w-4 h-4" /> },
            { id: 'usage', label: '用量', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'topup', label: '充值', icon: <CreditCard className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 概览 */}
        {activeTab === 'overview' && (
          <div className="grid sm:grid-cols-3 gap-6">
            {/* 余额卡片 */}
            <div className="sm:col-span-2 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-500/20 rounded-xl">
                  <Wallet className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm text-slate-400">账户余额</div>
                  <div className="text-4xl font-black text-white">¥{user?.balance.toFixed(2)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">累计消费</div>
                  <div className="text-xl font-bold text-white">¥{user?.total_spent.toFixed(2)}</div>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">活跃Key数</div>
                  <div className="text-xl font-bold text-white">{keys.length}</div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('topup')}
                className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                立即充值
              </button>
            </div>

            {/* 快速开始 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="font-bold">快速开始</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold mt-0.5">1</span>
                  <div>
                    <div className="text-white font-medium">创建API Key</div>
                    <div className="text-slate-500 text-xs">在「API Key」页面创建</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold mt-0.5">2</span>
                  <div>
                    <div className="text-white font-medium">复制接口地址</div>
                    <div className="text-slate-500 text-xs">api.agent-skills.net.cn</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold mt-0.5">3</span>
                  <div>
                    <div className="text-white font-medium">开始调用</div>
                    <div className="text-slate-500 text-xs">OpenAI兼容格式</div>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-500 mb-2">调用示例（cURL）</div>
                <div className="bg-slate-950 rounded-lg p-3 text-xs text-slate-400 font-mono">
                  curl ... api.agent-skills.net.cn ... -H "Authorization: Bearer YOUR_KEY"
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Key管理 */}
        {activeTab === 'apikey' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">API Key</h2>
                <p className="text-sm text-slate-400">用于调用Token API，请妥善保管，切勿泄露</p>
              </div>
              <button
                onClick={() => setShowNewKey(true)}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新建Key
              </button>
            </div>

            {/* 新建Key弹窗 */}
            {showNewKey && (
              <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 mb-6">
                <h3 className="font-bold mb-4">创建新的API Key</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Key名称（如：生产环境）"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={generateKey}
                    disabled={creating || !newKeyName.trim()}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    生成
                  </button>
                  <button
                    onClick={() => { setShowNewKey(false); setNewKeyName('') }}
                    className="text-slate-400 hover:text-white px-4 py-2.5 rounded-xl text-sm transition"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* Key列表 */}
            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white mb-1">{k.name}</div>
                      <div className="text-xs text-slate-500">创建于 {k.created}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full">{k.status}</span>
                      <button
                        onClick={() => copyKey(k.key)}
                        className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white"
                        title="复制Key"
                      >
                        {copied === k.key ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        className="p-2 hover:bg-red-500/10 rounded-lg transition text-slate-400 hover:text-red-400"
                        title="删除Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 font-mono text-sm text-slate-500 bg-slate-950 rounded-lg px-4 py-2">
                    {k.key}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-300">
              ⚠️ 请妥善保管您的API Key，切勿在公开场合泄露。丢失后无法恢复，只能重新生成。
            </div>
          </div>
        )}

        {/* 用量 */}
        {activeTab === 'usage' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">用量记录</h2>
                <p className="text-sm text-slate-400">实时Token消耗，透明可查</p>
              </div>
              <button className="text-sm text-slate-400 hover:text-white transition flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4" />
                刷新
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left px-5 py-3.5 font-medium">模型</th>
                    <th className="text-left px-5 py-3.5 font-medium">Token数</th>
                    <th className="text-left px-5 py-3.5 font-medium">消费</th>
                    <th className="text-left px-5 py-3.5 font-medium">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_RECORDS.map((r) => (
                    <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                      <td className="px-5 py-3.5">
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-mono">{r.model}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{r.tokens.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-cyan-400 font-bold">¥{r.cost.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-slate-500">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {MOCK_RECORDS.length === 0 && (
                <div className="py-16 text-center text-slate-500">
                  暂无消费记录，开始调用API即可看到用量
                </div>
              )}
            </div>

            {/* 统计图占位 */}
            <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>用量图表（即将上线）</p>
            </div>
          </div>
        )}

        {/* 充值 */}
        {activeTab === 'topup' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold">充值额度</h2>
              <p className="text-sm text-slate-400">选择套餐，额度永不过期（用完为止）</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { price: 50, credits: 55, label: '基础套餐' },
                { price: 200, credits: 240, label: '进阶套餐', highlight: true },
                { price: 500, credits: 650, label: '专业套餐' },
              ].map((plan) => (
                <div
                  key={plan.label}
                  className={`
                    relative rounded-2xl p-6 border cursor-pointer transition
                    ${plan.highlight
                      ? 'bg-gradient-to-b from-cyan-500/20 to-purple-500/10 border-cyan-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                    }
                  `}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold bg-cyan-500 text-white px-3 py-0.5 rounded-full">
                      推荐
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-sm text-slate-400 mb-2">{plan.label}</div>
                    <div className="text-4xl font-black text-white mb-1">¥{plan.price}</div>
                    <div className="text-sm text-slate-400">得 ¥{plan.credits} 额度</div>
                    <button className={`
                      mt-5 w-full py-2.5 rounded-xl text-sm font-medium transition
                      ${plan.highlight
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }
                    `}>
                      选择套餐
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 支付方式 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold mb-4">支付方式</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {['微信支付', '支付宝'].map((method) => (
                  <div key={method} className="flex items-center gap-3 p-4 bg-slate-800/60 rounded-xl border border-slate-700 cursor-pointer hover:border-cyan-500/40 transition">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-800">{method === '微信支付' ? '微' : '支'}</span>
                    </div>
                    <span className="font-medium">{method}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400">应付金额</span>
                  <span className="text-2xl font-black text-white">¥<span id="pay-amount">200</span></span>
                </div>
                <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition">
                  确认支付
                </button>
                <p className="text-center text-xs text-slate-500 mt-3">
                  支付成功后额度自动到账，请勿关闭页面
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-4 text-center text-sm text-slate-500 mt-12">
        <p>© 2026 养虾池 Token加油站</p>
      </footer>
    </div>
  )
}
