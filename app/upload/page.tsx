'use client'

import { useState } from 'react'
import { Upload, Github, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

// API Key检测函数（客户端显示用）
function detectApiKeys(text: string): string[] {
  const warnings: string[] = []
  
  if (/sk-[A-Za-z0-9]{20,}/.test(text)) {
    warnings.push('检测到OpenAI API Key (sk-...)')
  }
  if (/(api[_-]?key|apikey)[=:]\s*['"]?[A-Za-z0-9_\-]{16,}['"]?/i.test(text)) {
    warnings.push('检测到API Key')
  }
  if (/Bearer\s+[A-Za-z0-9_\-\.]+/.test(text)) {
    warnings.push('检测到Bearer Token')
  }
  if (/(access[_-]?key|secret[_-]?key)[=:]\s*['"]?[A-Za-z0-9+\/]{16,}['"]?/i.test(text)) {
    warnings.push('检测到云服务商密钥')
  }
  if (/(mongodb|mysql|postgres|redis):\/\/[^@\s]+:[^@\s]+@/.test(text)) {
    warnings.push('检测到数据库连接字符串')
  }
  
  return warnings
}

export default function UploadPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    github: '',
    channel: '通用',
    tags: ''
  })
  const [warnings, setWarnings] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  // 实时检测API Key
  const handleDescriptionChange = (value: string) => {
    setForm({ ...form, description: value })
    setWarnings(detectApiKeys(value))
  }

  const handleSubmit = async () => {
    setUploading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: '上传失败' })
    }
    
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-primary">
                S
              </div>
              <span className="text-xl font-bold">SkillHub China</span>
            </a>
          </div>
          <a href="/" className="hover:text-accent transition">返回首页</a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Upload className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">上传技能</h1>
              <p className="text-gray-500">分享您的AI Agent技能</p>
            </div>
          </div>

          {/* 安全提示 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-amber-500 mt-0.5" size={18} />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">🔒 安全提醒</p>
                <p>上传时系统会自动检测并隐藏API Key、Token等敏感信息</p>
              </div>
            </div>
          </div>

          {/* 表单 */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                技能名称 *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="例如: feishu-send"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                技能描述 *
              </label>
              <textarea
                value={form.description}
                onChange={e => handleDescriptionChange(e.target.value)}
                placeholder="描述技能功能...（如包含API Key会自动隐藏）"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              
              {/* API Key警告 */}
              {warnings.length > 0 && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-1">
                    <AlertTriangle size={16} />
                    检测到敏感信息
                  </div>
                  <ul className="text-red-500 text-sm list-disc list-inside">
                    {warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                  <p className="text-red-400 text-xs mt-1">
                    上传时将自动替换为 ****
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub仓库地址 *
              </label>
              <div className="flex items-center gap-2">
                <Github className="text-gray-400" size={20} />
                <input
                  type="url"
                  value={form.github}
                  onChange={e => setForm({ ...form, github: e.target.value })}
                  placeholder="https://github.com/username/repo"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  适用渠道
                </label>
                <select
                  value={form.channel}
                  onChange={e => setForm({ ...form, channel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="通用">通用</option>
                  <option value="飞书">飞书</option>
                  <option value="微信">微信</option>
                  <option value="钉钉">钉钉</option>
                  <option value="Telegram">Telegram</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签（逗号分隔）
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="例如: 文件,传输,飞书"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={uploading || !form.name || !form.description || !form.github}
              className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  上传中...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  上传技能
                </>
              )}
            </button>
          </div>

          {/* 结果 */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {result.success ? (
                <div className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-green-700">{result.message}</p>
                    {result.warnings && result.warnings.length > 0 && (
                      <p className="text-sm text-green-600 mt-1">{result.warnings[0]}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-red-600">{result.error}</p>
              )}
            </div>
          )}
        </div>

        {/* API说明 */}
        <div className="mt-8 bg-gray-800 text-gray-300 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">🤖 机器人API</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">获取技能列表（JSON）</p>
              <code className="bg-gray-900 px-3 py-2 rounded block">
                GET /api/skills
              </code>
            </div>
            <div>
              <p className="text-gray-400 mb-1">按渠道筛选</p>
              <code className="bg-gray-900 px-3 py-2 rounded block">
                GET /api/skills?channel=飞书
              </code>
            </div>
            <div>
              <p className="text-gray-400 mb-1">上传技能（自动隐藏API Key）</p>
              <code className="bg-gray-900 px-3 py-2 rounded block">
                POST /api/skills
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
