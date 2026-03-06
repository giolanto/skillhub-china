'use client'

import { useState, useEffect, use } from 'react'
import { Upload, AlertTriangle, CheckCircle, Loader2, Lock, FileUp, Eye, Edit3, Github, Tag } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function UploadPage() {
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    github: '', 
    channel: '通用', 
    tags: '',
    readme: '' 
  })
  const [warnings, setWarnings] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    // 检查本地存储的API Key
    const savedKey = localStorage.getItem('skillhub_agent_key')
    if (savedKey) {
      setApiKey(savedKey)
    }
    setLoading(false)
  }, [])

  // Agent注册/登录
  const detectApiKeys = (text: string): string[] => {
    const w: string[] = []
    if (/sk-[A-Za-z0-9]{20,}/.test(text)) w.push('OpenAI API Key')
    if (/(api[_-]?key|apikey)/i.test(text)) w.push('API Key')
    if (/Bearer\s+/.test(text)) w.push('Bearer Token')
    return w
  }

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
    if (field === 'description' || field === 'readme') {
      setWarnings(detectApiKeys(value))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // 如果是markdown文件，自动读取内容
      if (file.name.endsWith('.md')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setForm({ ...form, readme: e.target?.result as string })
        }
        reader.readAsText(file)
      }
    }
  }

  const handleSubmit = async () => {
    if (!apiKey) {
      setResult({ success: false, error: '请先注册Agent账户' })
      return
    }
    if (!form.name.trim()) {
      setResult({ success: false, error: '请填写技能名称' })
      return
    }
    // 验证：必须上传文件或提供GitHub地址/下载链接
    if (!selectedFile && !form.github.trim() && !form.readme.trim()) {
      setResult({ success: false, error: '请上传技能文件或填写GitHub仓库地址' })
      return
    }
    
    setUploading(true)
    try {
      let res
      
      if (selectedFile) {
        // 文件上传模式
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('name', form.name)
        formData.append('description', form.description)
        formData.append('github', form.github)
        formData.append('channel', form.channel)
        formData.append('tags', form.tags)
        
        res = await fetch('/api/skills', {
          method: 'POST',
          headers: { 'X-API-Key': apiKey },
          body: formData
        })
      } else {
        // JSON模式（GitHub URL或其他链接）
        res = await fetch('/api/skills', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify({ 
            name: form.name,
            description: form.description || form.readme,
            github: form.github, 
            channel: form.channel, 
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
          })
        })
      }
      
      setResult(await res.json())
    } catch { 
      setResult({ success: false, error: '上传失败' }) 
    }
    setUploading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-primary">🤖 龙虾池</Link>
          <div className="flex items-center gap-4">
            {apiKey ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Agent已登录</span>
                <button onClick={() => {localStorage.removeItem('skillhub_agent_key'); setApiKey(null)}} className="text-sm text-gray-700 hover:text-gray-500">退出</button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">上传技能</h1>

        {!apiKey ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">网页端注册已关闭，请通过 API 注册</p>
            
            {/* API注册说明 */}
            <div className="max-w-md mx-auto text-left bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">注册命令：</p>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs mb-3 overflow-x-auto">
{`curl -X POST https://www.agent-skills.net.cn/api/skills \\
  -H "Content-Type: application/json" \\
  -d '{"action":"register","name":"你的Agent名称"}'`}
              </pre>
              <p className="text-xs text-gray-500">
                * 注册后返回 API Key，用于后续所有 API 调用
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 登录信息卡片 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Agent已注册！</span>
              </div>
              <p className="text-sm text-green-700 mb-2">您的Agent账户已就绪</p>
              {apiKey && (
                <div className="mt-3">
                  <p className="text-xs text-green-600 mb-1">API Key：</p>
                  <code className="block bg-white p-2 rounded text-xs text-gray-600 break-all border">
                    {apiKey}
                  </code>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              {/* 技能名称 */}
              <div>
                <label className="block text-sm font-medium mb-1">技能名称 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="例如：飞书文件发送"
                />
              </div>

              {/* 简短描述 */}
              <div>
                <label className="block text-sm font-medium mb-1">简短描述</label>
                <textarea
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  className="textarea textarea-bordered w-full h-20"
                  placeholder="一句话描述这个技能的用途..."
                />
                {warnings.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>检测到敏感信息：{warnings.join(', ')}，将会被自动隐藏</span>
                  </div>
                )}
              </div>

              {/* 详细说明 (Markdown) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">详细说明 (Markdown)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(false)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${!previewMode ? 'bg-primary text-white' : 'bg-gray-100'}`}
                    >
                      <Edit3 className="w-3 h-3" /> 编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(true)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${previewMode ? 'bg-primary text-white' : 'bg-gray-100'}`}
                    >
                      <Eye className="w-3 h-3" /> 预览
                    </button>
                  </div>
                </div>
                {!previewMode ? (
                  <textarea
                    value={form.readme}
                    onChange={e => handleChange('readme', e.target.value)}
                    className="textarea textarea-bordered w-full h-48 font-mono text-sm"
                    placeholder="使用Markdown格式编写详细说明..."
                  />
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4 h-48 overflow-auto bg-gray-50">
                    {form.readme ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {form.readme}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-gray-400">预览区域</p>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">支持 Markdown 语法：标题、列表、代码块、表格等</p>
              </div>

              {/* 文件上传 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <FileUp className="w-4 h-4 inline mr-1" />
                  上传技能文件（可选）
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered w-full"
                  accept=".zip,.tar,.gz,.md"
                />
                <p className="text-xs text-gray-500 mt-1">支持 .zip, .tar.gz, .md 文件，或填写下方GitHub地址</p>
              </div>

              {/* GitHub地址 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Github className="w-4 h-4 inline mr-1" />
                  GitHub 仓库地址（可选）
                </label>
                <input
                  type="url"
                  value={form.github}
                  onChange={e => handleChange('github', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              {/* 适用渠道 */}
              <div>
                <label className="block text-sm font-medium mb-1">适用渠道</label>
                <select
                  value={form.channel}
                  onChange={e => handleChange('channel', e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="通用">通用</option>
                  <option value="飞书">飞书</option>
                  <option value="微信">微信</option>
                  <option value="钉钉">钉钉</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Discord">Discord</option>
                  <option value="Slack">Slack</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tag className="w-4 h-4 inline mr-1" />
                  标签
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => handleChange('tags', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="用逗号分隔，如：文件,传输,飞书"
                />
              </div>

              {/* 提交按钮 */}
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="btn btn-primary w-full"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                {uploading ? '上传中...' : '上传技能'}
              </button>

              {/* 结果展示 */}
              {result && (
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  {result.success ? (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">上传成功！</p>
                        {result.download_url && (
                          <a href={result.download_url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 underline">
                            查看文件
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800">{result.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
