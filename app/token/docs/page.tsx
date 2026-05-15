'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Code2,
  Copy,
  Check,
  ArrowLeft,
  Zap,
  AlertCircle,
  Globe,
} from 'lucide-react'

const LANGUAGES = [
  { id: 'curl', label: 'cURL' },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
]

const MODELS = [
  { name: 'gpt-4o', provider: 'OpenAI', price: '¥0.12/1K tokens', context: '128K' },
  { name: 'gpt-4o-mini', provider: 'OpenAI', price: '¥0.01/1K tokens', context: '128K' },
  { name: 'claude-3-5-sonnet', provider: 'Anthropic', price: '¥0.11/1K tokens', context: '200K' },
  { name: 'gemini-1.5-pro', provider: 'Google', price: '¥0.05/1K tokens', context: '1M' },
  { name: 'deepseek-chat', provider: '硅基流动', price: '¥0.001/1K tokens', context: '128K' },
  { name: 'glm-4', provider: '智谱AI', price: '¥0.05/1K tokens', context: '128K' },
  { name: 'qwen-plus', provider: '阿里云', price: '¥0.04/1K tokens', context: '128K' },
]

const CODE_SAMPLES: Record<string, string> = {
  curl: `curl https://api.agent-skills.net.cn/v1/chat/completions \\
  -H "Authorization: Bearer $YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "你好，介绍一下你自己"}
    ],
    "max_tokens": 1000
  }'`,
  python: `import openai

openai.api_key = "$YOUR_API_KEY"
openai.base_url = "https://api.agent-skills.net.cn/v1/"

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "你好，介绍一下你自己"}
    ],
    max_tokens=1000
)

print(response.choices[0].message.content)`,
  javascript: `import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.YOUR_API_KEY,
  baseURL: 'https://api.agent-skills.net.cn/v1'
});

async function main() {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: '你好，介绍一下你自己' }
    ],
    max_tokens: 1000
  });
  console.log(response.choices[0].message.content);
}

main();`,
}

const ERROR_CODES = [
  { code: 401, msg: '未授权 - API Key无效或已过期', solution: '检查API Key是否正确，是否已删除' },
  { code: 403, msg: '禁止访问 - 额度不足或账户被封禁', solution: '充值额度或联系客服' },
  { code: 429, msg: '请求过于频繁 - 触发了流控限制', solution: '降低请求频率，使用指数退避重试' },
  { code: 500, msg: '服务器内部错误 - 上游服务异常', solution: '稍后重试，如持续出现请联系客服' },
  { code: 503, msg: '服务不可用 - 渠道暂时不可用', solution: '切换到其他模型，或稍后重试' },
]

const QUICK_TIPS = [
  { title: '更换base_url', desc: '将官方 base_url 替换为 api.agent-skills.net.cn/v1，其他代码不变' },
  { title: '额度保护', desc: '建议在调用前检查余额，设置 max_tokens 防止意外超支' },
  { title: '模型名称', desc: '使用One-API中的模型名称（如 gpt-4o，而非 gpt-4-turbo）' },
  { title: 'Stream模式', desc: 'One-API完整支持stream模式，可实现打字机效果' },
]

export default function TokenDocsPage() {
  const [lang, setLang] = useState('curl')
  const [copied, setCopied] = useState(false)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const copy = (text: string, section?: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    if (section) setCopiedSection(section)
    setTimeout(() => { setCopied(false); setCopiedSection(null) }, 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* 顶部导航 */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/token" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
              <ArrowLeft className="w-4 h-4" />
              Token加油站
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-sm text-white">API文档</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* 标题 */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-cyan-400 text-sm mb-3">
            <BookOpen className="w-4 h-4" />
            API Reference
          </div>
          <h1 className="text-4xl font-black mb-3">API文档</h1>
          <p className="text-slate-400">
            标准OpenAI兼容接口，base_url替换即可使用，支持所有主流模型。
          </p>
        </div>

        {/* 快速开始 */}
        <section className="mb-12">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            快速开始
          </h2>
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { step: '1', title: '注册账号', desc: '前往养虾池注册账号，获赠¥5体验额度' },
                { step: '2', title: '获取API Key', desc: '在控制台创建API Key，妥善保管' },
                { step: '3', title: '开始调用', desc: '替换base_url，立即使用' },
              ].map((s) => (
                <div key={s.step} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <div className="font-bold text-white mb-1">{s.title}</div>
                    <div className="text-slate-400 text-sm">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 基础信息 */}
        <section className="mb-12">
          <h2 className="text-xl font-black mb-4">基础信息</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'API地址', value: 'api.agent-skills.net.cn', copyable: true },
              { label: '协议', value: 'HTTPS (必须)', copyable: false },
              { label: '认证方式', value: 'Bearer Token (API Key)', copyable: false },
              { label: '数据格式', value: 'JSON', copyable: false },
              { label: '字符编码', value: 'UTF-8', copyable: false },
              { label: 'OpenAI兼容', value: '✓ 完整兼容', copyable: false },
            ].map((item) => (
              <div key={item.label} className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
                <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-white">{item.value}</span>
                  {item.copyable && (
                    <button
                      onClick={() => copy(item.value, item.label)}
                      className="ml-auto text-slate-500 hover:text-white transition"
                    >
                      {copiedSection === item.label ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 模型列表与价格 */}
        <section className="mb-12">
          <h2 className="text-xl font-black mb-4">模型列表</h2>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left px-5 py-3.5 font-medium">模型</th>
                  <th className="text-left px-5 py-3.5 font-medium">来源</th>
                  <th className="text-left px-5 py-3.5 font-medium">价格</th>
                  <th className="text-left px-5 py-3.5 font-medium">上下文</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m) => (
                  <tr key={m.name} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-slate-200">{m.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{m.provider}</td>
                    <td className="px-5 py-3.5 text-cyan-400 font-bold">{m.price}</td>
                    <td className="px-5 py-3.5 text-slate-400">{m.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 调用示例 */}
        <section className="mb-12">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            调用示例
          </h2>

          {/* 语言切换 */}
          <div className="flex gap-1 mb-4 bg-slate-900/60 p-1 rounded-xl w-fit border border-slate-800">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition
                  ${lang === l.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : 'text-slate-400 hover:text-white'
                  }
                `}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* 代码块 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-sm text-slate-500">{LANGUAGES.find((l) => l.id === lang)?.label}</span>
              </div>
              <button
                onClick={() => copy(CODE_SAMPLES[lang])}
                className="text-xs text-slate-500 hover:text-white transition"
              >
                {copied ? '✅ 已复制' : '复制'}
              </button>
            </div>
            <pre className="p-5 text-sm text-slate-300 overflow-x-auto font-mono leading-relaxed">
              <code>{CODE_SAMPLES[lang]}</code>
            </pre>
          </div>
        </section>

        {/* 错误码 */}
        <section className="mb-12">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            错误码说明
          </h2>
          <div className="space-y-3">
            {ERROR_CODES.map((e) => (
              <div key={e.code} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <span className="font-mono bg-red-500/20 text-red-400 px-2.5 py-1 rounded-lg text-sm shrink-0">
                    {e.code}
                  </span>
                  <div>
                    <div className="font-medium text-white mb-1">{e.msg}</div>
                    <div className="text-slate-400 text-sm">→ {e.solution}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 使用技巧 */}
        <section className="mb-12">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            使用技巧
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {QUICK_TIPS.map((tip) => (
              <div key={tip.title} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="font-bold text-white mb-2">{tip.title}</div>
                <div className="text-slate-400 text-sm">{tip.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 底部CTA */}
        <div className="text-center bg-gradient-to-b from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-8">
          <p className="text-slate-400 mb-5">准备好开始使用了？</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/token/dashboard"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition"
            >
              前往控制台
            </Link>
            <Link
              href="/token"
              className="text-slate-400 hover:text-white transition"
            >
              查看套餐 →
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500 mt-12">
        <p>© 2026 养虾池 Token加油站 API文档</p>
      </footer>
    </div>
  )
}
