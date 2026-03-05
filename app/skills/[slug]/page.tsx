'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Download, Star, ArrowLeft, Github, Terminal, Copy, ThumbsUp, MessageCircle } from 'lucide-react'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

interface Review { id: number; rating: number; content: string; created_at: string }

export default function SkillDetail() {
  const params = useParams()
  const slug = params?.slug as string
  
  const [skill, setSkill] = useState<any>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [liked, setLiked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    
    // 获取技能
    const queryParam = !isNaN(Number(slug)) ? `id=eq.${slug}` : `name=ilike.*${slug}*`
    fetch(`${supabaseUrl}/rest/v1/skills?${queryParam}`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    }).then(r => r.json()).then(data => {
      if (data?.[0]) {
        setSkill(data[0])
        // 获取评价
        return fetch(`${supabaseUrl}/rest/v1/reviews?skill_id=eq.${data[0].id}&order=created_at.desc&limit=10`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }).then(r => r.json())
      }
    }).then(reviews => {
      setReviews(reviews || [])
      setLoading(false)
    })
  }, [slug])

  const handleLike = async () => {
    if (liked || !skill) return
    await fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${skill.id}`, {
      method: 'PATCH',
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes: (skill.likes || 0) + 1 })
    })
    setLiked(true)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`openclaw install https://agent-skills.net.cn/api/skills/${skill?.id}?action=download`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const [newRating, setNewRating] = useState(0)
  const [reviewContent, setReviewContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')

  const renderStars = (rating: number, size: string = 'w-4 h-4') => Array.from({length:5},(_,i)=><Star key={i} className={`${size} ${i<rating?'text-yellow-500 fill-yellow-500':'text-gray-300'}`}/>)

  const submitReview = async () => {
    if (!skill || newRating === 0) { setReviewMsg('请选择星级'); return }
    setSubmitting(true)
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/reviews`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ skill_id: skill.id, rating: newRating, content: reviewContent })
      })
      if (res.ok) {
        setReviews([{ id: Date.now(), rating: newRating, content: reviewContent, created_at: new Date().toISOString() }, ...reviews])
        setNewRating(0); setReviewContent(''); setReviewMsg('评价成功！')
      } else setReviewMsg('提交失败')
    } catch { setReviewMsg('提交失败') }
    setSubmitting(false)
    setTimeout(() => setReviewMsg(''), 3000)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">加载中...</div></div>
  if (!skill) return <div className="min-h-screen flex items-center justify-center"><div><h1 className="text-2xl font-bold mb-4">技能不存在</h1><Link href="/" className="text-primary">返回首页</Link></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white/80 border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600"><ArrowLeft className="w-5 h-5"/>返回</Link>
          {skill.github && <a href={skill.github} target="_blank" className="flex items-center gap-2"><Github className="w-5 h-5"/>GitHub</a>}
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{skill.name}</h1>
              <p className="text-lg text-gray-600">{skill.description}</p>
            </div>
            <button onClick={handleLike} className={`flex items-center gap-1 px-3 py-1 rounded-full border ${liked?'bg-red-50 border-red-200 text-red-500':'bg-white border-gray-200'}`}>
              <ThumbsUp className={`w-4 h-4 ${liked?'fill-current':''}`}/>{skill.likes||0}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {(skill.channel||[]).map((c: string)=><span key={c} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{c}</span>)}
            {(skill.tags||[]).map((t: string)=><span key={t} className="px-3 py-1 bg-gray-100 rounded-full">{t}</span>)}
          </div>
          <div className="flex gap-3">
            {skill.download_url && <a href={`/api/skills/${skill.id}?action=download`} target="_blank" className="px-6 py-3 bg-primary text-white rounded-lg flex items-center gap-2"><Download className="w-5 h-5"/>下载技能</a>}
            {skill.github && <a href={skill.github} target="_blank" className="px-6 py-3 bg-gray-900 text-white rounded-lg flex items-center gap-2"><Github className="w-5 h-5"/>GitHub</a>}
          </div>
        </div>
        {skill.download_url && <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <div className="flex justify-between mb-3"><h3 className="text-white flex items-center gap-2"><Terminal className="w-5 h-5"/>OpenClaw安装命令</h3><button onClick={handleCopy} className="text-gray-400 hover:text-white">{copied?'已复制':'复制'}</button></div>
          <code className="text-green-400 text-sm">openclaw install https://agent-skills.net.cn/api/skills/{skill.id}?action=download</code>
        </div>}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border text-center"><div className="text-2xl font-bold">{skill.downloads||0}</div><div className="text-sm text-gray-500">下载</div></div>
          <div className="bg-white p-4 rounded-xl border text-center"><div className="text-2xl font-bold">{skill.views||0}</div><div className="text-sm text-gray-500">浏览</div></div>
          <div className="bg-white p-4 rounded-xl border text-center"><div className="text-2xl font-bold">{skill.likes||0}</div><div className="text-sm text-gray-500">点赞</div></div>
          <div className="bg-white p-4 rounded-xl border text-center"><div className="text-2xl font-bold">{reviews.length?(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1):'-'}</div><div className="text-sm text-gray-500">评分</div></div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5"/>用户评价 ({reviews.length})</h2>
          {/* 评价表单 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="mb-3">
              <span className="text-sm text-gray-600 mr-2">我的评分：</span>
              <button className="flex gap-1" onClick={() => setNewRating(0)}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-6 h-6 cursor-pointer transition ${i <= newRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`} onClick={(e) => { e.stopPropagation(); setNewRating(i) }}/>
                ))}
              </button>
            </div>
            <textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} placeholder="写下你的评价..." className="w-full p-3 border rounded-lg mb-3 text-sm" rows={3}/>
            <div className="flex items-center gap-3">
              <button onClick={submitReview} disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50">{submitting ? '提交中...' : '提交评价'}</button>
              {reviewMsg && <span className={`text-sm ${reviewMsg.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>{reviewMsg}</span>}
            </div>
          </div>
          {reviews.length===0?<p className="text-gray-400">暂无评价</p>:<div className="space-y-4">{reviews.map(r=><div key={r.id} className="border-b pb-4"><div className="flex gap-2 mb-2">{renderStars(r.rating, 'w-4 h-4')}<span className="text-sm text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span></div><p>{r.content}</p></div>)}</div>}
        </div>
      </main>
    </div>
  )
}
