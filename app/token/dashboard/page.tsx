'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Wallet, Key, BarChart3, CreditCard, Plus, Trash2, Copy,
  Check, RefreshCw, Shield, ArrowLeft, Loader2, LogOut, Eye, EyeOff,
} from 'lucide-react'

// API配置
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.agent-skills.net.cn'

// 从localStorage获取token（登录后会有）
function getAuthToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('sb:token') || localStorage.getItem('auth_token') || null
}

// 模型定价映射
const MODEL_PRICES: Record<string, number> = {
  'gpt-4o': 0.12, 'gpt-4o-mini': 0.01,
  'claude-3-5-sonnet': 0.11, 'gemini-1.5-pro': 0.05,
  'deepseek-chat': 0.001, 'glm-4': 0.05,
  'qwen-plus': 0.04, 'minimax-01': 0.01,
}

type Tab = 'overview' | 'apikey' | 'usage' | 'topup'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  last_used_at: string | null
  created_at: string
  is_active: boolean
  api_key?: string // 新建时返回完整key
}

interface UsageRecord {
  id: number
  model: string
  tokens: number
  cost: number
  date: string
}

interface DashboardData {
  email: string
  balance: number
  total_spent: number
  keys: ApiKey[]
  usage: UsageRecord[]
}

const MOCK_RECORDS: UsageRecord[] = [
  { id: 1, model: 'GPT-4o', tokens: 1200, cost: 0.24, date: '2026-05-15 10:23' },
  { id: 2, model: 'Claude-3.5', tokens: 800, cost: 0.16, date: '2026-05-15 09:45' },
  { id: 3, model: 'GPT-4o', tokens: 2000, cost: 0.40, date: '2026-05-14 22:10' },
]

const PLAN_CREDITS: Record<string, number> = {
  '体验套餐': 5, '基础套餐': 55, '进阶套餐': 240,
  '专业套餐': 650, '企业套餐': 1400,
}

const MOCK_USER = {
  email: 'zealot@example.com',
  balance: 5.00,
  total_spent: 0,
}

export default function TokenDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [user] = useState(MOCK_USER)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [showNewKey, setShowNewKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [creating, setCreating] = useState(false)
  const [newKeyDisplay, setNewKeyDisplay] = useState<string | null>(null) // 新建key时显示完整key
  const [selectedPlan, setSelectedPlan] = useState<string>('进阶套餐')
  const [payLoading, setPayLoading] = useState(false)

  const [dashboardData, setDashboardData] = useState<{
    balance: number
    total_spent: number
    keys: ApiKey[]
    usage: UsageRecord[]
  } | null>(null)

  // 加载真实数据（仅当有auth token时）
  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      // 无token，用mock数据（未登录状态）
      setDashboardData({ balance: 5, total_spent: 0, keys: [], usage: [] })
      return
    }
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    try {
      const token = getAuthToken()
      if (!token) return

      // 获取API Keys
      const keysRes = await fetch(`${API_BASE}/api/token/keys`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (keysRes.ok) {
        const keysData = await keysRes.json()
        setKeys(keysData.keys || [])
      }

      // 获取用户信息（从Supabase获取）
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data: { user: sbUser } } = await supabase.auth.getUser(token)
        if (sbUser) {
          // 查询余额（通过service role或者直接用anon查询）
          // 这里用Supabase的REST API查token_users表
          const userRes = await supabase.from('token_users').select('balance, total_spent').eq('id', sbUser.id).single()
          if (userRes.data) {
            setDashboardData({
              balance: userRes.data.balance ?? 5,
              total_spent: userRes.data.total_spent ?? 0,
              keys: keysData.keys || [],
              usage: MOCK_RECORDS,
            })
          } else {
            setDashboardData({ balance: 5, total_spent: 0, keys: [], usage: MOCK_RECORDS })
          }
        }
      }
    } catch (e) {
      console.error('[Dashboard] 加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  async function generateKey() {
    if (!newKeyName.trim()) return
    const token = getAuthToken()
    if (!token) { alert('请先登录养虾池'); return }
    setCreating(true)
    try {
      const res = await fetch(`${API_BASE}/api/token/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName }),
      })
      const data = await res.json()
      if (res.ok && data.api_key) {
        setNewKeyDisplay(data.api_key)
        setKeys([data, ...keys])
        setNewKeyName('')
      } else {
        alert(data.error || '创建失败')
      }
    } catch (e) {
      alert('创建失败，请重试')
    } finally {
      setCreating(false)
    }
  }

  async function deleteKey(keyId: string) {
    if (!confirm('确认删除该API Key？删除后不可恢复。')) return
    const token = getAuthToken()
    if (!token) return
    const res = await fetch(`${API_BASE}/api/token/keys?id=${keyId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setKeys(keys.filter(k => k.id !== keyId))
    }
  }

  async function handleTopup() {
    const planCredits = PLAN_CREDITS[selectedPlan] || 0
    const planPrice = { '体验套餐': 5, '基础套餐': 50, '进阶套餐': 200, '专业套餐': 500, '企业套餐': 1000 }[selectedPlan] || 0
    alert(`套餐：${selectedPlan}，应付：¥${planPrice}，到账：¥${planCredits}\n\n支付功能即将上线，敬请期待！`)
  }

  const balance = dashboardData?.balance ?? 5
  const totalSpent = dashboardData?.total_spent ?? 0

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
            <div className="text-sm text-slate-400">{user.email}</div>
            <div className="bg-slate-800 rounded-full px-3 py-1 text-sm">
              <span className="text-slate-400">余额 </span>
              <span className="text-cyan-400 font-bold">¥{balance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">我的Token</h1>
          <p className="text-slate-400">
            管理API Key、查看用量、充值额度
            {!getAuthToken() && <span className="text-yellow-400 ml-2">（当前为演示模式，请登录养虾池获取真实数据）</span>}
          </p>
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========== 概览 ========== */}
        {activeTab === 'overview' && (
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-500/20 rounded-xl">
                  <Wallet className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm text-slate-400">账户余额</div>
                  <div className="text-4xl font-black text-white">¥{balance.toFixed(2)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">累计消费</div>
                  <div className="text-xl font-bold text-white">¥{totalSpent.toFixed(2)}</div>
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
                {[
                  { step: '1', title: '创建API Key', desc: '在「API Key」页面创建' },
                  { step: '2', title: '复制接口地址', desc: 'api.agent-skills.net.cn' },
                  { step: '3', title: '开始调用', desc: 'OpenAI兼容格式' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold mt-0.5">{item.step}</span>
                    <div>
                      <div className="text-white font-medium">{item.title}</div>
                      <div className="text-slate-500 text-xs">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-500 mb-2">调用示例（cURL）</div>
                <div className="bg-slate-950 rounded-lg p-3 text-xs text-slate-400 font-mono break-all">
                  curl https://api.agent-skills.net.cn/v1/chat/completions -H "Authorization: Bearer YOUR_KEY"
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== API Key ========== */}
        {activeTab === 'apikey' && (
          <div>
            {newKeyDisplay && (
              <div className="mb-6 p-5 bg-green-500/10 border border-green-500/30 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="font-bold text-green-400">API Key创建成功！</span>
                </div>
                <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm text-cyan-300 break-all mb-3">
                  {newKeyDisplay}
                </div>
                <p className="text-xs text-yellow-400">⚠️ 请立即复制并保存，关闭页面后将无法再次查看！</p>
                <button onClick={() => setNewKeyDisplay(null)} className="mt-3 text-sm text-slate-400 hover:text-white transition">关闭</button>
              </div>
            )}

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
                    onKeyDown={(e) => e.key === 'Enter' && generateKey()}
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

            {keys.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Key className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>暂无API Key，点击上方「新建Key」创建一个</p>
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => (
                  <div key={k.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white mb-1">{k.name}</div>
                        <div className="text-xs text-slate-500">
                          创建于 {new Date(k.created_at).toLocaleDateString('zh-CN')}
                          {k.last_used_at && ` · 最近使用 ${new Date(k.last_used_at).toLocaleDateString('zh-CN')}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${k.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {k.is_active ? '活跃' : '已禁用'}
                        </span>
                        <button onClick={() => { navigator.clipboard.writeText(`sk-ts-${k.key_prefix}`); setCopied(k.id); setTimeout(() => setCopied(null), 2000) }} className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white" title="复制Key">
                          {copied === k.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteKey(k.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition text-slate-400 hover:text-red-400" title="删除Key">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 font-mono text-sm text-slate-500 bg-slate-950 rounded-lg px-4 py-2">
                      sk-ts-{k.key_prefix}••••••••••••
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-300">
              ⚠️ 请妥善保管您的API Key，切勿在公开场合泄露。丢失后无法恢复，只能重新生成。
            </div>
          </div>
        )}

        {/* ========== 用量 ========== */}
        {activeTab === 'usage' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">用量记录</h2>
                <p className="text-sm text-slate-400">实时Token消耗，透明可查</p>
              </div>
              <button onClick={() => loadDashboard()} className="text-sm text-slate-400 hover:text-white transition flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4" />
                刷新
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
              {loading ? (
                <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-400" /></div>
              ) : dashboardData?.usage.length ? (
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
                    {dashboardData.usage.map((r) => (
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
              ) : (
                <div className="py-16 text-center text-slate-500">
                  <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>暂无消费记录，开始调用API即可看到用量</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== 充值 ========== */}
        {activeTab === 'topup' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold">充值额度</h2>
              <p className="text-sm text-slate-400">选择套餐，额度永不过期（用完为止）</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { price: 5, credits: 5, label: '体验套餐', desc: '尝鲜体验' },
                { price: 50, credits: 55, label: '基础套餐', desc: '+10%赠送' },
                { price: 200, credits: 240, label: '进阶套餐', desc: '+20%赠送', highlight: true },
                { price: 500, credits: 650, label: '专业套餐', desc: '+30%赠送' },
                { price: 1000, credits: 1400, label: '企业套餐', desc: '+40%赠送' },
              ].map((plan) => (
                <div
                  key={plan.label}
                  onClick={() => setSelectedPlan(plan.label)}
                  className={`relative rounded-2xl p-6 border cursor-pointer transition ${selectedPlan === plan.label ? 'bg-gradient-to-b from-cyan-500/20 to-purple-500/10 border-cyan-500/40' : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'}`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold bg-cyan-500 text-white px-3 py-0.5 rounded-full">推荐</div>
                  )}
                  <div className="text-center">
                    <div className="text-sm text-slate-400 mb-2">{plan.label}</div>
                    <div className="text-4xl font-black text-white mb-1">¥{plan.price}</div>
                    <div className="text-sm text-cyan-400 mb-2">得 ¥{plan.credits} 额度</div>
                    <div className="text-xs text-slate-500">{plan.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold mb-4">支付方式</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  { label: '微信支付', icon: '微', color: 'bg-green-500' },
                  { label: '支付宝', icon: '支', color: 'bg-blue-500' },
                ].map((method) => (
                  <div key={method.label} className="flex items-center gap-3 p-4 bg-slate-800/60 rounded-xl border border-slate-700 cursor-pointer hover:border-cyan-500/40 transition">
                    <div className={`w-8 h-8 ${method.color} rounded-lg flex items-center justify-center text-xs font-bold text-white`}>{method.icon}</div>
                    <span className="font-medium">{method.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400">应付金额</span>
                  <span className="text-2xl font-black text-white">
                    ¥{({ '体验套餐': 5, '基础套餐': 50, '进阶套餐': 200, '专业套餐': 500, '企业套餐': 1000 }[selectedPlan] || 0)}
                  </span>
                </div>
                <button
                  onClick={handleTopup}
                  disabled={payLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {payLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  确认支付
                </button>
                <p className="text-center text-xs text-slate-500 mt-3">支付成功后额度自动到账，请勿关闭页面</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-800 py-6 px-4 text-center text-sm text-slate-500 mt-12">
        <p>© 2026 养虾池 Token加油站</p>
      </footer>
    </div>
  )
}