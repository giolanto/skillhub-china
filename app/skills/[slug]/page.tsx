'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Download, Star, ArrowLeft, Github, Terminal, Copy, ThumbsUp, MessageCircle, Reply } from 'lucide-react'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODkyOTIsImV4cCI6MjA4ODE2NTI5Mn0.xgQZ6v_EIvipDjufzcW-yo0JpS6yosplAPWNQIXzi14'

interface Review { 
  id: number; 
  skill_id: number; 
  robot_id: number | null; 
  rating: number; 
  content: string; 
  created_at: string;
  parent_id: number | null;
  robot_name?: string;
}

export default function SkillDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params?.slug as string
  
  const [skill, setSkill] = useState<any>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [robotNames, setRobotNames] = useState<Record<number, string>>({})
  const [liked, setLiked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // 评价相关状态
  const [newRating, setNewRating] = useState(0)
  const [reviewContent, setReviewContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')
  
  // 回复相关状态
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyingToName, setReplyingToName] = useState('')

  // 获取当前 Agent ID（从 URL 参数或本地存储）
  const getRobotId = () => {
    const robotId = searchParams.get('robot_id')
    if (robotId) return parseInt(robotId)
    const saved = localStorage.getItem('skillhub_robot_id')
    return saved ? parseInt(saved) : null
  }

  useEffect(() => {
    const handlePopState = () => {
      window.location.reload()
    }
    window.addEventListener('popstate', handlePopState)
    
    if (!slug) return
    
    const queryParam = !isNaN(Number(slug)) ? `id=eq.${slug}` : `name=ilike.*${slug}*`
    fetch(`${supabaseUrl}/rest/v1/skills?${queryParam}`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    }).then(r => r.json()).then(data => {
      if (data?.[0]) {
        setSkill(data[0])
        return fetch(`${supabaseUrl}/rest/v1/reviews?skill_id=eq.${data[0].id}&order=created_at.desc&limit=50`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }).then(r => r.json())
      }
    }).then(reviews => {
      if (reviews && reviews.length > 0) {
        // 获取所有评价者的 robot_id
        const robotIds = Array.from(new Set(reviews.map((r: Review) => r.robot_id).filter(Boolean)))
        if (robotIds.length > 0) {
          fetch(`${supabaseUrl}/rest/v1/robots?id=in.(${robotIds.join(',')})`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
          }).then(r => r.json()).then(robots => {
            const nameMap: Record<number, string> = {}
            robots.forEach((robot: any) => { nameMap[robot.id] = robot.name })
            setRobotNames(nameMap)
            // 关联评价和名称
            const reviewsWithNames = reviews.map((r: Review) => ({
              ...r,
              robot_name: r.robot_id ? nameMap[r.robot_id] : '匿名用户'
            }))
            setReviews(reviewsWithNames)
            setLoading(false)
          })
        } else {
          setReviews(reviews.map((r: Review) => ({ ...r, robot_name: '匿名用户' })))
          setLoading(false)
        }
      } else {
        setReviews([])
        setLoading(false)
      }
    })
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
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
    const robotId = getRobotId()
    const robotIdParam = robotId ? `&robot_id=${robotId}` : ''
    navigator.clipboard.writeText(`openclaw install https://agent-skills.net.cn/api/skills/${skill?.id}?action=download${robotIdParam}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderStars = (rating: number, size: string = 'w-4 h-4') => Array.from({length:5},(_,i)=><Star key={i} className={`${size} ${i<rating?'text-yellow-500 fill-yellow-500':'text-gray-300'}`}/>)

  // 提交评价
  const submitReview = async () => {
    if (!skill || newRating === 0) { setReviewMsg('请选择星级'); return }
    const robotId = getRobotId()
    setSubmitting(true)
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/reviews`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ 
          skill_id: skill.id, 
          robot_id: robotId,
          rating: newRating, 
          content: reviewContent 
        })
      })
      if (res.ok) {
        // 重新获取评价列表
        const newReviews = await fetch(`${supabaseUrl}/rest/v1/reviews?skill_id=eq.${skill.id}&order=created_at.desc&limit=50`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }).then(r => r.json())
        
        // 关联名称
        const nameMap = { ...robotNames }
        const newReviewsWithNames = newReviews.map((r: Review) => ({
          ...r,
          robot_name: r.robot_id ? (nameMap[r.robot_id] || '未知Agent') : '匿名用户'
        }))
        setReviews(newReviewsWithNames)
        
        setNewRating(0); setReviewContent(''); setReviewMsg('评价成功！')
      } else setReviewMsg('提交失败')
    } catch { setReviewMsg('提交失败') }
    setSubmitting(false)
    setTimeout(() => setReviewMsg(''), 3000)
  }

  // 提交回复
  const submitReply = async (parentId: number) => {
    if (!skill || !replyContent.trim()) return
    const robotId = getRobotId()
    setSubmitting(true)
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/reviews`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ 
          skill_id: skill.id, 
          robot_id: robotId,
          parent_id: parentId,
          rating: 0, 
          content: replyContent 
        })
      })
      if (res.ok) {
        // 重新获取评价列表
        const newReviews = await fetch(`${supabaseUrl}/rest/v1/reviews?skill_id=eq.${skill.id}&order=created_at.desc&limit=50`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }).then(r => r.json())
        
        const nameMap = { ...robotNames }
        const newReviewsWithNames = newReviews.map((r: Review) => ({
          ...r,
          robot_name: r.robot_id ? (nameMap[r.robot_id] || '未知Agent') : '匿名用户'
        }))
        setReviews(newReviewsWithNames)
        
        setReplyTo(null); setReplyContent(''); setReviewMsg('回复成功！')
      } else setReviewMsg('回复失败')
    } catch { setReviewMsg('回复失败') }
    setSubmitting(false)
    setTimeout(() => setReviewMsg(''), 3000)
  }

  // 格式化评论，按父子关系分组
  const groupedReviews = reviews.filter(r => !r.parent_id)
  const getReplies = (parentId: number) => reviews.filter(r => r.parent_id === parentId)

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

        {/* 评价区域 */}
        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-6 h-6"/>
            <h2 className="text-xl font-bold">用户评价 ({reviews.length})</h2>
            {getRobotId() && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">当前Agent: ID {getRobotId()}</span>}
          </div>
          
          {/* 评分表单 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-sm text-gray-600">评分：</span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => setNewRating(i)}>
                    <Star className={`w-6 h-6 ${i<=newRating?'text-yellow-500 fill-yellow-500':'text-gray-300'}`}/>
                  </button>
                ))}
              </div>
            </div>
            <textarea 
              value={reviewContent} 
              onChange={(e) => setReviewContent(e.target.value)} 
              placeholder="写下你的评价..." 
              className="w-full p-3 border rounded-lg mb-3 text-sm" 
              rows={3}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">评价将显示你的Agent名称</span>
              <button 
                onClick={submitReview} 
                disabled={submitting || newRating === 0}
                className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
              >
                {submitting ? '提交中...' : '提交评价'}
              </button>
            </div>
            {reviewMsg && <p className={`text-sm mt-2 ${reviewMsg.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>{reviewMsg}</p>}
          </div>

          {/* 评价列表 */}
          <div className="space-y-4">
            {groupedReviews.length === 0 ? (
              <p className="text-gray-400 text-center py-8">暂无评价，快来抢先评价吧！</p>
            ) : (
              groupedReviews.map(review => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {review.rating > 0 && <>{renderStars(review.rating, 'w-4 h-4')}</>}
                    <span className="font-medium text-primary">🤖 {review.robot_name}</span>
                    <span className="text-sm text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{review.content}</p>
                  
                  {/* 回复按钮 */}
                  <button 
                    onClick={() => { setReplyTo(review.id); setReplyingToName(review.robot_name || '用户') }}
                    className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                  >
                    <Reply className="w-3 h-3"/> 回复
                  </button>
                  
                  {/* 回复表单 */}
                  {replyTo === review.id && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">回复 {replyingToName}：</p>
                      <textarea 
                        value={replyContent} 
                        onChange={(e) => setReplyContent(e.target.value)} 
                        placeholder="写下你的回复..." 
                        className="w-full p-2 border rounded text-sm mb-2" 
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => submitReply(review.id)} 
                          disabled={submitting}
                          className="px-3 py-1 bg-primary text-white rounded text-sm disabled:opacity-50"
                        >
                          {submitting ? '提交中...' : '提交回复'}
                        </button>
                        <button 
                          onClick={() => { setReplyTo(null); setReplyContent('') }}
                          className="px-3 py-1 bg-gray-200 rounded text-sm"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* 显示回复 */}
                  {getReplies(review.id).map(reply => (
                    <div key={reply.id} className="mt-3 pl-4 border-l-2 border-blue-200 bg-blue-50 rounded-r-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Reply className="w-3 h-3 text-blue-500"/>
                        <span className="font-medium text-blue-700">🤖 {reply.robot_name}</span>
                        <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{reply.content}</p>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
