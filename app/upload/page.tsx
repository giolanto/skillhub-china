'use client'

import { useState, useEffect } from 'react'
import { Upload, AlertTriangle, CheckCircle, Loader2, Lock, FileUp } from 'lucide-react'
import { signInWithGithub, getCurrentUser, signOut, User } from '@/lib/supabase'
import Link from 'next/link'

export default function UploadPage() {
  const [form, setForm] = useState({ name: '', description: '', github: '', channel: '通用', tags: '' })
  const [warnings, setWarnings] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const detectApiKeys = (text: string): string[] => {
    const w: string[] = []
    if (/sk-[A-Za-z0-9]{20,}/.test(text)) w.push('OpenAI API Key')
    if (/(api[_-]?key|apikey)/i.test(text)) w.push('API Key')
    if (/Bearer\s+/.test(text)) w.push('Bearer Token')
    return w
  }

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
    if (field === 'description') setWarnings(detectApiKeys(value))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleSubmit = async () => {
    if (!user) return
    if (!form.name.trim()) {
      setResult({ success: false, error: '请填写技能名称' })
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
          body: formData
        })
      } else {
        // JSON模式（GitHub URL或其他链接）
        res = await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...form, 
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

  const handleLogin = async () => {
    try {
      const newUser = await signInWithGithub()
      setUser(newUser)
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
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
          <Link href="/" className="text-xl font-bold text-primary">🤖 SkillHub China</Link>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user.username}</span>
                <button onClick={handleLogout} className="text-sm text-gray-700 hover:text-gray-500">退出</button>
              </div>
            ) : (
              <button onClick={handleLogin} className="btn-primary btn-sm">登录</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">上传技能</h1>

        {!user ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">登录后即可上传技能</p>
            <button onClick={handleLogin} className="btn btn-primary">GitHub 登录</button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
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

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium mb-1">描述</label>
              <textarea
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                className="textarea textarea-bordered w-full h-24"
                placeholder="描述这个技能的用途..."
              />
              {warnings.length > 0 && (
                <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>检测到敏感信息：{warnings.join(', ')}，将会被自动隐藏</span>
                </div>
              )}
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

            {/* GitHub地址 - 不再必填 */}
            <div>
              <label className="block text-sm font-medium mb-1">GitHub 地址（可选）</label>
              <input
                type="url"
                value={form.github}
                onChange={e => handleChange('github', e.target.value)}
                className="input input-bordered w-full"
                placeholder="https://github.com/..."
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
                <option value="Telegram">Telegram</option>
                <option value="Discord">Discord</option>
                <option value="Slack">Slack</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>

            {/* 标签 */}
            <div>
              <label className="block text-sm font-medium mb-1">标签</label>
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
        )}
      </main>
    </div>
  )
}
