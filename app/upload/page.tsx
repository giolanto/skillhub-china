'use client'

import { useState, useEffect } from 'react'
import { Upload, AlertTriangle, CheckCircle, Loader2, Lock } from 'lucide-react'
import { signInWithGithub, getCurrentUser, signOut, User } from '@/lib/supabase'
import Link from 'next/link'

export default function UploadPage() {
  const [form, setForm] = useState({ name: '', description: '', github: '', channel: '通用', tags: '' })
  const [warnings, setWarnings] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleSubmit = async () => {
    if (!user) return
    setUploading(true)
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          user_id: user.id 
        })
      })
      setResult(await res.json())
    } catch { setResult({ success: false, error: '上传失败' }) }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-primary text-white px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-primary">S</div>
            <span className="text-xl font-bold">SkillHub China</span>
          </Link>
          <Link href="/" className="hover:text-accent">返回首页</Link>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="text-amber-500" size={40} />
            </div>
            <h1 className="text-2xl font-bold mb-4">登录后可上传技能</h1>
            <p className="text-gray-500 mb-8">为了防止滥用，上传技能需要先登录GitHub账号</p>
            <button onClick={handleLogin} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
              使用GitHub账号登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-primary">S</div>
          <span className="text-xl font-bold">SkillHub China</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">U</div>
            )}
            <span className="text-sm">{user.username}</span>
          </div>
          <button onClick={handleLogout} className="text-sm hover:text-accent">退出</button>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center"><Upload className="text-white" /></div>
            <div><h1 className="text-2xl font-bold">上传技能</h1><p className="text-gray-500">分享您的AI Agent技能</p></div>
          </div>
          {warnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <div className="flex items-center gap-2 text-red-600 text-sm"><AlertTriangle size={16} />检测到敏感信息，将自动隐藏</div>
            </div>
          )}
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-2">技能名称 *</label>
              <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="feishu-send" /></div>
            <div><label className="block text-sm font-medium mb-2">技能描述 *</label>
              <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} className="w-full px-4 py-3 border rounded-lg" rows={4} placeholder="描述技能功能..." /></div>
            <div><label className="block text-sm font-medium mb-2">GitHub地址 *</label>
              <input type="url" value={form.github} onChange={e => handleChange('github', e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="https://github.com/..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-2">适用渠道</label>
                <select value={form.channel} onChange={e => handleChange('channel', e.target.value)} className="w-full px-4 py-3 border rounded-lg">
                  <option value="通用">通用</option><option value="飞书">飞书</option><option value="微信">微信</option><option value="钉钉">钉钉</option></select></div>
              <div><label className="block text-sm font-medium mb-2">标签</label>
                <input type="text" value={form.tags} onChange={e => handleChange('tags', e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="文件,传输" /></div>
            </div>
            <button onClick={handleSubmit} disabled={uploading || !form.name || !form.description} className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50 flex justify-center gap-2">
              {uploading ? <><Loader2 className="animate-spin" />上传中...</> : <><Upload />上传技能</>}
            </button>
          </div>
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              {result.success ? <div className="flex items-center gap-2"><CheckCircle className="text-green-500" /><span>{result.message}</span></div> : <span className="text-red-600">{result.error}</span>}
            </div>
          )}
        </div>
        <div className="mt-8 bg-gray-800 text-gray-300 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">🤖 机器人API</h3>
          <code className="bg-gray-900 px-3 py-2 rounded block text-sm">GET /api/skills</code>
          <code className="bg-gray-900 px-3 py-2 rounded block text-sm mt-2">POST /api/skills</code>
        </div>
      </div>
    </div>
  )
}
