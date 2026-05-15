'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Zap,
  Shield,
  ArrowRight,
  Check,
  ChevronDown,
  BookOpen,
  Code2,
  CreditCard,
  Rocket,
  Star,
} from 'lucide-react'

// 套餐数据
const PLANS = [
  {
    name: '体验套餐',
    price: 5,
    credits: 5,
    bonus: 0,
    description: '尝鲜体验',
    highlight: false,
    tag: null,
  },
  {
    name: '基础套餐',
    price: 50,
    credits: 55,
    bonus: 10,
    description: '个人日常使用',
    highlight: false,
    tag: null,
  },
  {
    name: '进阶套餐',
    price: 200,
    credits: 240,
    bonus: 20,
    description: '开发者/重度用户',
    highlight: true,
    tag: '推荐',
  },
  {
    name: '专业套餐',
    price: 500,
    credits: 650,
    bonus: 30,
    description: '小团队/商用',
    highlight: false,
    tag: null,
  },
  {
    name: '企业套餐',
    price: 1000,
    credits: 1400,
    bonus: 40,
    description: '大规模商用',
    highlight: false,
    tag: '超值',
  },
]

// 支持的模型
const MODELS = [
  { name: 'GPT-4o', provider: 'OpenAI', color: 'bg-green-500' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', color: 'bg-orange-500' },
  { name: 'Gemini 1.5 Pro', provider: 'Google', color: 'bg-blue-500' },
  { name: 'DeepSeek Chat', provider: '硅基流动', color: 'bg-sky-500' },
  { name: 'GLM-4', provider: '智谱AI', color: 'bg-purple-500' },
  { name: '通义千问', provider: '阿里云', color: 'bg-orange-400' },
  { name: 'MiniMax', provider: 'MiniMax', color: 'bg-cyan-500' },
  { name: 'Kimi', provider: 'Moonshot', color: 'bg-violet-500' },
]

// 场景
const USE_CASES = [
  {
    icon: <Rocket className="w-6 h-6 text-cyan-400" />,
    title: 'AI应用开发',
    desc: '调用GPT-4o/Claude开发AI应用，稳定快速',
  },
  {
    icon: <BookOpen className="w-6 h-6 text-purple-400" />,
    title: '知识库问答',
    desc: '接入知识库系统，提供精准的RAG问答',
  },
  {
    icon: <Code2 className="w-6 h-6 text-green-400" />,
    title: '代码助手',
    desc: 'Claude代码辅助，开发者效率翻倍',
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    title: '自动化工作流',
    desc: 'Agent技能调用，稳定可靠的Token供给',
  },
]

// 优势
const BENEFITS = [
  { icon: '🔗', text: 'OpenAI兼容接口' },
  { icon: '⚡', text: '国内快速访问' },
  { icon: '🛡️', text: '额度保护，防封号' },
  { icon: '📊', text: '用量透明可查' },
  { icon: '🤝', text: '养虾池生态集成' },
  { icon: '💰', text: '按量计费，不浪费' },
]

export default function TokenPage() {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const API_EXAMPLE = `curl https://api.agent-skills.net.cn/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "你好"}]
  }'`

  const copyCode = () => {
    navigator.clipboard.writeText(API_EXAMPLE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* 顶部导航栏 */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🦐</span>
            <span className="font-bold text-lg">养虾池</span>
            <span className="text-slate-400 text-sm ml-2">Token加油站</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="#plans" className="hover:text-white transition">套餐</Link>
            <Link href="#models" className="hover:text-white transition">支持模型</Link>
            <Link href="#docs" className="hover:text-white transition">API文档</Link>
            <Link href="/token/dashboard" className="hover:text-white transition">控制台</Link>
            <Link
              href="/token/dashboard"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              立即使用
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero区 */}
      <section className="relative overflow-hidden py-24 px-4">
        {/* 背景装饰 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-sm text-cyan-400 mb-6">
            <Zap className="w-3.5 h-3.5" />
            养虾池官方Token服务 · 稳定可靠
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Token加油站
            </span>
            <br />
            <span className="text-3xl md:text-5xl text-slate-200">为AI而生，一站无忧</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            整合GPT-4o、Claude、Gemini等主流模型，统一API接口，
            <br className="hidden md:block" />
            不用折腾官方渠道，也能享受稳定可靠的AI调用体验。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/token/dashboard"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3.5 rounded-xl text-lg font-bold hover:opacity-90 transition flex items-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              <Zap className="w-5 h-5" />
              免费注册体验
            </Link>
            <Link
              href="#docs"
              className="text-slate-400 hover:text-white transition px-6 py-3.5 rounded-xl text-lg flex items-center gap-2 border border-slate-700 hover:border-slate-500"
            >
              <BookOpen className="w-5 h-5" />
              查看API文档
            </Link>
          </div>

          {/* 亮点数字 */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-10 border-t border-slate-800">
            {[
              { value: '8+', label: '支持模型' },
              { value: '99.9%', label: '可用性保障' },
              { value: '¥5', label: '最低体验门槛' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 套餐区 */}
      <section id="plans" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3">选择你的套餐</h2>
            <p className="text-slate-400">所有套餐均为一次性购买，额度永不过期（用完为止）</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                onMouseEnter={() => setHoveredPlan(plan.name)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`
                  relative rounded-2xl p-5 border transition-all duration-300 cursor-pointer
                  ${plan.highlight
                    ? 'bg-gradient-to-b from-cyan-500/20 to-purple-500/10 border-cyan-500/40 shadow-xl shadow-cyan-500/10 scale-105'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                  }
                  ${hoveredPlan === plan.name ? 'scale-105 shadow-xl' : ''}
                `}
              >
                {/* 标签 */}
                {plan.tag && (
                  <div className={`
                    absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 rounded-full
                    ${plan.tag === '推荐' ? 'bg-cyan-500 text-white' : 'bg-purple-500 text-white'}
                  `}>
                    {plan.tag}
                  </div>
                )}

                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">{plan.name}</div>
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-3xl font-black text-white">¥{plan.price}</span>
                  </div>
                  {plan.bonus > 0 && (
                    <div className="text-xs text-cyan-400 mb-2">+{plan.bonus}%赠送</div>
                  )}
                  <div className="text-slate-400 text-sm mb-4">得 ¥{plan.credits} 额度</div>
                  <div className="text-xs text-slate-500 mb-5">{plan.description}</div>

                  <button
                    className={`
                      w-full py-2 rounded-lg text-sm font-medium transition
                      ${plan.highlight
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }
                    `}
                  >
                    立即购买
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-500 text-sm mt-8">
            💡 所有套餐额度永不过期 · 额度用完可叠加充值 ·{' '}
            <Link href="/token/dashboard" className="text-cyan-400 hover:underline">
              先注册送¥5体验额度 →
            </Link>
          </p>
        </div>
      </section>

      {/* 支持模型 */}
      <section id="models" className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3">支持的AI模型</h2>
            <p className="text-slate-400">一个接口，调用所有主流模型，无需分开管理</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MODELS.map((model) => (
              <div
                key={model.name}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition"
              >
                <div className={`w-2 h-2 rounded-full ${model.color} mb-3`} />
                <div className="font-bold text-white mb-0.5">{model.name}</div>
                <div className="text-xs text-slate-500">{model.provider}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8">
            {BENEFITS.map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/40 rounded-lg px-3 py-2">
                <span>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 场景 */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3">适用场景</h2>
            <p className="text-slate-400">覆盖开发、知识库、自动化等主流AI调用场景</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {USE_CASES.map((uc) => (
              <div key={uc.title} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition">
                <div className="mb-4 p-2.5 bg-slate-800/60 rounded-xl w-fit">{uc.icon}</div>
                <h3 className="font-bold text-white mb-2">{uc.title}</h3>
                <p className="text-slate-400 text-sm">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API文档 */}
      <section id="docs" className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3">快速接入</h2>
            <p className="text-slate-400">标准OpenAI兼容接口，5分钟即可接入</p>
          </div>

          {/* 调用示例 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-sm text-slate-500">cURL 示例</span>
              </div>
              <button
                onClick={copyCode}
                className="text-xs text-slate-500 hover:text-white transition"
              >
                {copied ? '✅ 已复制' : '复制'}
              </button>
            </div>
            <pre className="p-5 text-sm text-slate-300 overflow-x-auto font-mono">
              <code>{API_EXAMPLE}</code>
            </pre>
          </div>

          {/* 特性列表 */}
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {[
              { title: 'OpenAI兼容格式', desc: '无需修改代码，直接替换base_url即可', icon: <Code2 className="w-5 h-5" /> },
              { title: '统一额度管理', desc: '一个账户管理所有模型额度，透明清晰', icon: <CreditCard className="w-5 h-5" /> },
              { title: '额度保护机制', desc: '防高频调用、防封号，调用更稳定', icon: <Shield className="w-5 h-5" /> },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="text-cyan-400 mt-0.5 shrink-0">{f.icon}</div>
                <div>
                  <div className="font-bold text-white mb-1">{f.title}</div>
                  <div className="text-slate-400 text-sm">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/token/docs"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
            >
              完整API文档
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-b from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-3xl p-12">
            <div className="text-5xl mb-6">🦐</div>
            <h2 className="text-3xl font-black mb-4">准备好开始了吗？</h2>
            <p className="text-slate-400 mb-8">
              注册即送 ¥5 体验额度，无需绑定信用卡<br />
              用养虾池技能时，Token自动扣除，方便无忧
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/token/dashboard"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3.5 rounded-xl text-lg font-bold hover:opacity-90 transition flex items-center gap-2"
              >
                <Star className="w-5 h-5" />
                立即开始
              </Link>
              <Link
                href="/"
                className="text-slate-400 hover:text-white transition flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                返回养虾池
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 text-center text-sm text-slate-500">
        <p>© 2026 养虾池 Token加油站 · <Link href="/" className="hover:text-slate-400">返回养虾池</Link></p>
        <p className="mt-2 text-xs text-slate-600">
          Token服务由养虾池提供，额度永不过期，严禁用于非法用途
        </p>
      </footer>
    </div>
  )
}
