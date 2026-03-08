'use client'

import Link from 'next/link'
import { ArrowRight, Code, Download, Key, Rocket, Zap, BookOpen, MessageCircle, CheckCircle } from 'lucide-react'

export default function StartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-primary text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="text-blue-200 hover:text-white mb-4 inline-flex items-center gap-1">
            ← 返回首页
          </Link>
          <h1 className="text-4xl font-bold mb-2">📖 新手指南</h1>
          <p className="text-blue-100">让您的AI Agent快速接入养虾池技能市场</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* 快速开始 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            快速开始
          </h2>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-yellow-500" />
              第一步：获取API Key
            </h3>
            <ol className="space-y-3 text-gray-600">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                <span>访问 <Link href="/api/docs" className="text-blue-600 hover:underline">API文档</Link> 页面</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                <span>点击"注册Agent"按钮，填写Agent名称</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                <span>获取API Key，格式为 <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">sk_xxxxx</code></span>
              </li>
            </ol>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-500" />
              第二步：配置您的Agent
            </h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`# 在OpenClaw中配置养虾池技能源
# 设置环境变量或配置文件

SKILL_MARKET_URL=https://www.agent-skills.net.cn/api/skills
SKILL_MARKET_API_KEY=您的API_Key`}</pre>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-green-500" />
              第三步：安装技能
            </h3>
            <p className="text-gray-600 mb-4">
              您的Agent可以直接从养虾池安装技能：
            </p>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`# Agent安装技能示例
curl -X POST "https://www.agent-skills.net.cn/api/skills" \\
  -H "X-API-Key: 您的API_Key" \\
  -F "name=技能名称" \\
  -F "description=技能描述"`}</pre>
            </div>
          </div>
        </section>

        {/* 推荐技能套装 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            推荐技能套装
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
              <h3 className="font-semibold text-lg mb-2">🇨🇳 中文资讯套装</h3>
              <p className="text-gray-500 text-sm mb-3">适合需要实时资讯的Agent</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">微信搜索</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">RSS阅读器</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">天气查询</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">百度热榜</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-pink-500">
              <h3 className="font-semibold text-lg mb-2">📹 视频工作流套装</h3>
              <p className="text-gray-500 text-sm mb-3">适合内容创作和视频分析</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">B站视频下载</span>
                <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">字幕下载</span>
                <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">视频总结</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
              <h3 className="font-semibold text-lg mb-2">💻 开发者套装</h3>
              <p className="text-gray-500 text-sm mb-3">适合编程和开发任务</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">GitHub操作</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">API网关</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">系统化调试</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-purple-500">
              <h3 className="font-semibold text-lg mb-2">📝 内容创作套装</h3>
              <p className="text-gray-500 text-sm mb-3">适合写作和知识管理</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">公众号助手</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">flomo笔记</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Notion同步</span>
              </div>
            </div>
          </div>
        </section>

        {/* 常见问题 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            常见问题
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="font-semibold mb-2">Q: 如何让我的Agent使用养虾池？</h3>
              <p className="text-gray-600 text-sm">
                A: 在Agent配置中添加养虾池API地址和Key即可。您的Agent会通过API自动获取技能列表和安装技能。
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="font-semibold mb-2">Q: 技能安装收费吗？</h3>
              <p className="text-gray-600 text-sm">
                A: 养虾池所有技能完全免费。技能由社区贡献，平台不收取任何费用。
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="font-semibold mb-2">Q: 技能在哪里查看使用说明？</h3>
              <p className="text-gray-600 text-sm">
                A: 每个技能详情页都有完整的使用说明、参数配置和示例代码。
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="font-semibold mb-2">Q: 可以自己上传技能吗？</h3>
              <p className="text-gray-600 text-sm">
                A: 可以！点击导航栏"上传技能"，按指引提交您的技能即可。
              </p>
            </div>
          </div>
        </section>

        {/* 联系反馈 */}
        <section className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">需要帮助？</h2>
          <p className="text-gray-600 mb-6">
            有问题或建议？联系我们！
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/api/docs" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2">
              查看API文档 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition inline-flex items-center gap-2">
              返回首页
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p>© 2026 养虾池. All rights reserved.</p>
          <p className="text-sm mt-2">Made with ❤️ for Chinese AI Developers</p>
        </div>
      </footer>
    </div>
  )
}
