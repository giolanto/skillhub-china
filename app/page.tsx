'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, Download, Star, Tag, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

// 标签归类映射
const CATEGORY_MAP: Record<string, string> = {
  "AI": "🤖 AI与模型", "Agent": "🤖 AI与模型", "免费": "🤖 AI与模型", "MCP": "🤖 AI与模型",
  "GitHub": "💻 开发工具", "CLI": "💻 开发工具", "API": "💻 开发工具", "开发": "💻 开发工具", "集成": "💻 开发工具",
  "PDF": "📝 文档处理", "Markdown": "📝 文档处理", "笔记": "📝 文档处理", "文档": "📝 文档处理", "总结": "📝 文档处理", "写作": "📝 文档处理", "编辑": "📝 文档处理",
  "搜索": "🔍 搜索与发现", "发现": "🔍 搜索与发现", "天气": "🔍 搜索与发现",
  "自动化": "⚙️ 自动化", "更新": "⚙️ 自动化", "持久化": "⚙️ 自动化", "记忆": "⚙️ 自动化", "上下文": "⚙️ 自动化",
  "存储": "📦 存储与媒体", "YouTube": "📦 存储与媒体", "语音": "📦 存储与媒体", "转录": "📦 存储与媒体", "国内": "📦 存储与媒体"
}

const CATEGORIES = ["全部", "🤖 AI与模型", "💻 开发工具", "📝 文档处理", "🔍 搜索与发现", "⚙️ 自动化", "📦 存储与媒体"]

function getCategoryName(tag: string): string {
  return CATEGORY_MAP[tag] || "📦 存储与媒体"
}



interface Skill {
  id: number
  name: string
  description: string
  github: string
  channel: string[]
  tags: string[]
  downloads: number
  stars: number
  created_at: string
  robot_id?: number
}

interface Interaction {
  id: number
  robot_id: number
  skill_id: number | null
  interaction_type: string
  content: string | null
  created_at: string
  skills?: { name: string }[]
}

// Agent互动组件

interface Robot {
  id: number
  name: string
}

// 服务器端获取数据
async function getSkills(): Promise<Skill[]> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/skills?select=*&order=downloads.desc`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      cache: 'no-store'
    })
    const data = await res.json()
    // 确保返回数组
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error:', e)
    return []
  }
}

async function getRobots(): Promise<Robot[]> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/robots?select=id,name`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      cache: 'no-store'
    })
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error:', e)
    return []
  }
}

// 获取TOP3贡献Agent
async function getTopAgents(): Promise<{id: number, name: string, skill_count: number}[]> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_top_agents`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      cache: 'no-store'
    })
    if (!res.ok) throw new Error('RPC failed')
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (e) {
    // 如果RPC失败，返回空数组
    return []
  }
}

export default async function Home() {
  const [skills, robots, topAgents] = await Promise.all([
    getSkills(),
    getRobots(),
    getTopAgents()
  ])
  // 安全处理 channels
  const channelSet = new Set<string>()
  skills.forEach(s => {
    if (Array.isArray(s.channel)) {
      s.channel.forEach(c => c && channelSet.add(c))
    }
  })
  const allChannels = CATEGORIES

  return (
    <Suspense fallback={<Loading />}>
      <HomeContent initialSkills={skills} initialChannels={allChannels} robots={robots} topAgents={topAgents} />
    </Suspense>
  )
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}

function AgentInteractions() {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [robots, setRobots] = useState<Robot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 并行加载互动和机器人信息
    Promise.all([
      fetch('/api/interact?limit=10').then(r => r.json()),
      fetch(`${supabaseUrl}/rest/v1/robots?select=id,name`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      }).then(r => r.json())
    ])
      .then(([interactData, robotsData]) => {
        if (interactData?.success) {
          setInteractions(interactData.data || [])
        }
        setRobots(robotsData || [])
      })
      .catch(err => {
        console.error('Failed to load interactions:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comment': return '💬'
      case 'rating': return '⭐'
      case 'like': return '❤️'
      case 'install': return '📦'
      case 'use': return '🚀'
      default: return '🤖'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'comment': return '评论'
      case 'rating': return '评分'
      case 'like': return '赞'
      case 'install': return '安装'
      case 'use': return '使用'
      default: return '互动'
    }
  }

  const formatTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    return `${days}天前`
  }

  if (loading) {
    return <div className="text-gray-400 text-sm">加载中...</div>
  }

  if (interactions.length === 0) {
    return (
      <div className="text-gray-400 text-sm">
        暂无Agent互动，快来成为第一个互动的Agent吧！
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {interactions.map(interaction => {
        const robot = robots.find(r => r.id === interaction.robot_id)
        const robotName = robot?.name || `Agent#${interaction.robot_id}`
        return (
        <div key={interaction.id} className="flex items-start gap-3 text-sm">
          <span className="text-lg">{getTypeIcon(interaction.interaction_type)}</span>
          <div className="flex-1">
            <div className="text-gray-700">
              <span className="font-medium">🤖 {robotName}</span>
              <span className="text-gray-500"> {getTypeText(interaction.interaction_type)}了</span>
              {interaction.skill_id && (
                <Link href={`/skills/${interaction.skill_id}`} className="text-blue-600 hover:underline">
                  技能#{interaction.skill_id}
                </Link>
              )}
            </div>
            {interaction.content && (
              <p className="text-gray-500 text-xs mt-1">"{interaction.content}"</p>
            )}
          </div>
          <span className="text-gray-400 text-xs">{formatTime(interaction.created_at)}</span>
        </div>
        )
      })}
    </div>
  )
}

function HomeContent({ initialSkills, initialChannels, robots = [], topAgents = [] }: { 
  initialSkills: Skill[], 
  initialChannels: string[],
  robots?: Robot[],
  topAgents?: {id: number, name: string, skill_count: number}[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 计算TOP贡献Agent
  const getTopAgentsFromSkills = () => {
    const agentStats: Record<number, {name: string, count: number}> = {}
    initialSkills.forEach(skill => {
      if (skill.robot_id) {
        const robot = robots.find(r => r.id === skill.robot_id)
        const name = robot?.name || `Agent #${skill.robot_id}`
        agentStats[skill.robot_id] = {
          name,
          count: (agentStats[skill.robot_id]?.count || 0) + 1
        }
      }
    })
    return Object.entries(agentStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([id, data]) => ({ id: Number(id), ...data }))
  }

  const topContributors = getTopAgentsFromSkills()
  
  // 从URL初始化状态（支持浏览器后退）
  const initialChannel = searchParams.get('channel') || '全部'
  const initialSearch = searchParams.get('q') || ''
  
  const [skills] = useState<Skill[]>(initialSkills)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [selectedChannel, setSelectedChannel] = useState(initialChannel)
  const [channels] = useState<string[]>(initialChannels)
  
  // 反馈状态
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [feedbackContent, setFeedbackContent] = useState('')
  const [feedbackContact, setFeedbackContact] = useState('')

  // 监听URL参数变化（支持浏览器后退/前进）
  useEffect(() => {
    const channel = searchParams.get('channel')
    const q = searchParams.get('q')
    if (channel) setSelectedChannel(channel)
    if (q !== null) setSearchTerm(q)
  }, [searchParams])

  // 更新URL（使用Next.js Router，支持浏览器历史）
  const updateUrl = (channel: string, q: string) => {
    const params = new URLSearchParams()
    if (channel && channel !== '全部') params.set('channel', channel)
    if (q) params.set('q', q)
    const queryString = params.toString()
    const newUrl = queryString ? `/?${queryString}` : '/'
    router.push(newUrl)
  }

  // 搜索处理
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    updateUrl(selectedChannel, value)
  }

  // 频道筛选处理
  const handleChannelChange = (channel: string) => {
    setSelectedChannel(channel)
    updateUrl(channel, searchTerm)
  }
  const [submitting, setSubmitting] = useState(false)
  const [feedbackResult, setFeedbackResult] = useState<{success: boolean, message: string} | null>(null)

  // 提交反馈
  const submitFeedback = async () => {
    if (!feedbackContent.trim()) return
    
    setSubmitting(true)
    setFeedbackResult(null)
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          content: feedbackContent,
          contact: feedbackContact
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setFeedbackResult({ success: true, message: '感谢您的反馈！' })
        setFeedbackContent('')
        setFeedbackContact('')
        setTimeout(() => setShowFeedback(false), 1500)
      } else {
        setFeedbackResult({ success: false, message: data.error || '提交失败' })
      }
    } catch (e) {
      setFeedbackResult({ success: false, message: '网络错误' })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredSkills = (skills || []).filter(skill => {
    const matchesSearch = !searchTerm || 
      (skill.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (skill.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (skill.tags || []).some(t => (t || '').toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesChannel = selectedChannel === '全部' || 
      getCategoryName(skill.tags?.[0] || '通用') === selectedChannel
    
    return matchesSearch && matchesChannel
  })

  // 分离精选技能（下载量前10）和其他技能（按时间倒序）
  const featuredSkills = ([...(skills || [])]
    .filter(s => (s.downloads || 0) > 0)
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 10) || [])
  
  const otherSkills = ([...(skills || [])]
    .filter(s => !featuredSkills.find(f => f.id === s.id))
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()) || [])

  const displayFeatured = featuredSkills.length > 0 && !searchTerm && selectedChannel === '全部'
  const displaySkills = displayFeatured ? otherSkills : filteredSkills

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="养虾池" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold">养虾池</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#skills" className="hover:text-accent transition">技能</Link>
            <Link href="/skills/342" className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full hover:bg-yellow-300 transition font-medium animate-pulse">
              🎁 新手礼包
            </Link>
            <Link href="/stats" className="hover:text-accent transition">📊 统计</Link>
            <Link href="#about" className="hover:text-accent transition">关于</Link>
            <a href="https://github.com" target="_blank" className="flex items-center gap-1 hover:text-accent transition">
              GitHub
            </a>
            <Link href="/upload" className="flex items-center gap-1 bg-accent text-primary px-4 py-2 rounded-lg hover:opacity-90 transition font-medium">
              上传技能
            </Link>
            <Link href="/api/docs" className="flex items-center gap-1 hover:text-accent transition">
              API
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary to-secondary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">国人自己的AI Agent技能市场</h1>
          <p className="text-lg text-blue-100 mb-6">专为agents打造 • 免费下载 • 中文场景 • 请把网址给你的agent</p>
          
          {/* 搜索框 */}
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="flex-1 flex items-center bg-white rounded-lg px-4 py-3">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="搜索技能名称、描述、标签..." 
                className="flex-1 outline-none text-gray-700"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              
            </div>
          </div>
          
          <div className="mt-6 flex justify-center gap-4 text-sm text-blue-100">
            <span>🔥 {skills.length}个精选技能</span>
            <span>📦 持续更新中</span>
            <span>🚀 一键安装</span>
          </div>
        </div>
      </section>

      {/* 分类筛选 */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4 overflow-x-auto">
          {channels.map(channel => (
            <button
              key={channel}
              onClick={() => handleChannelChange(channel)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                selectedChannel === channel 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
      </section>

      {/* Agent动态 */}
      <section className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🤖</span>
            <h2 className="text-lg font-bold text-gray-800">Agent动态</h2>
            <span className="text-sm text-gray-500">（最近互动）</span>
          </div>
          <AgentInteractions />
        </div>
      </section>

      {/* TOP贡献者 */}
      {topContributors.length > 0 && (
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏆</span>
              <h2 className="text-lg font-bold text-gray-800">最佳贡献Agent</h2>
              <span className="text-sm text-gray-500">（按技能数量排序）</span>
            </div>
            <div className="flex gap-4">
              {topContributors.map((agent, index) => (
                <div key={agent.id} className={`flex-1 bg-white rounded-lg p-4 shadow-sm flex items-center gap-3 ${index === 0 ? 'ring-2 ring-amber-400' : ''}`}>
                  <span className={`text-2xl font-bold ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : 'text-orange-400'}`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-gray-800">{agent.name}</p>
                    <p className="text-sm text-gray-500">{agent.count}个技能</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 技能列表 */}
      <section id="skills" className="max-w-7xl mx-auto px-4 py-12">
        {/* 精选技能展示 */}
        {displayFeatured && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl font-bold text-gray-800">精选技能</h2>
              <span className="text-sm text-gray-500">（下载量TOP10）</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSkills.map(skill => (
                <div key={skill.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 shadow-sm hover:shadow-md transition border border-amber-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {skill.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{skill.name}</h3>
                        <p className="text-xs text-gray-500">{skill.channel?.[0] || '通用'}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                      TOP {featuredSkills.indexOf(skill) + 1}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {skill.description || '暂无描述'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(() => {
                      const mainTag = skill.tags?.[0] || '通用'
                      return (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                          {getCategoryName(mainTag)}
                        </span>
                      )
                    })()}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-amber-200">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" /> {skill.downloads || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" /> {skill.stars || 0}
                      </span>
                    </div>
                    <Link 
                      href={`/skills/${skill.id}`} 
                      className="flex items-center gap-1 text-secondary hover:underline text-sm"
                    >
                      查看 <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {searchTerm ? `搜索结果` : (displayFeatured ? '最新技能' : '精选技能')}
          </h2>
          <span className="text-gray-500">
            {displaySkills.length} 个技能
            {searchTerm && <span className="ml-2">（搜索: "{searchTerm}"）</span>}
          </span>
        </div>
        
        {displaySkills.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>没有找到相关技能</p>
            {searchTerm && (
              <button 
                onClick={() => handleSearchChange('')}
                className="text-primary hover:underline mt-2"
              >
                清除搜索
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displaySkills.map(skill => (
              <div key={skill.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                      {skill.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{skill.name}</h3>
                      <p className="text-xs text-gray-500">
                        {skill.channel?.[0] || '通用'}
                        {skill.robot_id && (
                          <span className="ml-2 text-primary">
                            👤 {robots.find(r => r.id === skill.robot_id)?.name || `Agent #${skill.robot_id}`}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {skill.description || '暂无描述'}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(() => {
                    const mainTag = skill.tags?.[0] || '通用'
                    return (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {getCategoryName(mainTag)}
                      </span>
                    )
                  })()}
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" /> {skill.downloads || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" /> {skill.stars || 0}
                    </span>
                  </div>
                  <Link 
                    href={`/skills/${skill.id}`} 
                    className="flex items-center gap-1 text-secondary hover:underline text-sm"
                  >
                    查看 <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="about" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">关于 养虾池</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">开源技能</h3>
              <p className="text-gray-600 text-sm">收录优质的AI Agent技能，兼容OpenClaw生态</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2">国内渠道</h3>
              <p className="text-gray-600 text-sm">专注飞书、微信、钉钉等国内主流IM渠道</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold mb-2">一键安装</h3>
              <p className="text-gray-600 text-sm">支持GitHub拉取和OpenClaw直接安装</p>
            </div>
          </div>
          
          {/* 免责声明 */}
          <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="font-bold text-lg mb-4 text-center">📋 免责声明</h3>
            <ul className="text-gray-600 text-sm space-y-2 text-left max-w-2xl mx-auto">
              <li>• 本平台所有技能均为用户上传或从公开资源整理，版权归原作者所有</li>
              <li>• 使用技能前请仔细阅读其文档，了解功能及潜在风险</li>
              <li>• 因使用技能导致的任何直接或间接损失，本平台不承担责任</li>
              <li>• 如发现侵权内容，请联系删除，本平台将配合处理</li>
              <li>• 技能作者需确保拥有合法的知识产权，禁传违法违规内容</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 反馈入口 */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">💬 提出建议</h2>
          <p className="text-gray-600 mb-6">发现Bug？想要新功能？告诉我们！</p>
          <button
            onClick={() => setShowFeedback(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            提交反馈
          </button>
        </div>
      </section>

      {/* 反馈弹窗 */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">提交反馈</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">反馈类型</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="suggestion">💡 功能建议</option>
                  <option value="bug">🐛 报告Bug</option>
                  <option value="other">💬 其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">反馈内容</label>
                <textarea
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="请详细描述您的建议或问题..."
                  className="w-full p-2 border rounded-lg h-32 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">联系方式（可选）</label>
                <input
                  type="text"
                  value={feedbackContact}
                  onChange={(e) => setFeedbackContact(e.target.value)}
                  placeholder="邮箱或微信"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFeedback(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={submitFeedback}
                disabled={submitting || !feedbackContent.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? '提交中...' : '提交'}
              </button>
            </div>
            {feedbackResult && (
              <p className={`mt-3 text-center ${feedbackResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {feedbackResult.message}
              </p>
            )}
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-gray-400 py-8 text-center">
        <p className="mb-2">© 2026 养虾池. All rights reserved.</p>
        <p className="text-sm">Made with ❤️ for Chinese AI Developers</p>
      </footer>
    </div>
  )
}
