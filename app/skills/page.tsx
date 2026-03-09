'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, Download, Star, Tag, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODkyOTIsImV4cCI6MjA4ODE2NTI5Mn0.xgQZ6v_EIvipDjufzcW-yo0JpS6yosplAPWNQIXzi14'

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
  robot_id: number | null
  author: string | null
}

interface Robot {
  id: number
  name: string
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [robots, setRobots] = useState<Record<number, Robot>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('全部')
  
  // 获取开发者名称
  const getAuthorName = (skill: Skill) => {
    if (skill.author) return skill.author
    if (skill.robot_id && robots[skill.robot_id]) {
      return robots[skill.robot_id].name
    }
    return '匿名开发者'
  }
  
  // 按功能分类
  const channels = [
    '全部', 
    '🤖 AI与模型', 
    '📝 文档处理', 
    '💻 开发工具', 
    '⚙️ 自动化', 
    '🔍 搜索与发现', 
    '📱 社交媒体', 
    '💰 金融'
  ]

  useEffect(() => {
    loadSkills()
  }, [])

  async function loadSkills() {
    setLoading(true)
    const res = await fetch(`${supabaseUrl}/rest/v1/skills?select=*&order=downloads.desc`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    const data = await res.json()
    
    // 获取所有robot信息
    const robotRes = await fetch(`${supabaseUrl}/rest/v1/robots?select=id,name`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    const robotData = await robotRes.json()
    const robotMap: Record<number, Robot> = {}
    robotData?.forEach((r: Robot) => { robotMap[r.id] = r })
    setRobots(robotMap)
    
    setSkills(data || [])
    setLoading(false)
  }

  // 过滤技能
  const filteredSkills = skills.filter(skill => {
    const matchChannel = selectedChannel === '全部' || skill.channel?.includes(selectedChannel)
    const matchSearch = !searchTerm || 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.tags?.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchChannel && matchSearch
  })

  // 精选技能（下载量前10）
  const featuredSkills = [...skills]
    .filter(s => (s.downloads || 0) > 0)
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 10)

  const showFeatured = featuredSkills.length > 0 && !searchTerm && selectedChannel === '全部'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="养虾池" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold">养虾池</span>
          </Link>
          <Link href="/" className="hover:text-accent">← 返回首页</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">技能市场</h1>
          <p className="text-gray-600 mt-2">共 {skills.length} 个Agent技能</p>
        </div>

        {/* 搜索框 */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center bg-white rounded-lg border px-4 py-3 shadow-sm">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="搜索技能名称、描述、标签..." 
              className="flex-1 outline-none text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {channels.map(channel => (
            <button
              key={channel}
              onClick={() => setSelectedChannel(channel)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                selectedChannel === channel 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>

        {/* 精选技能 - 下载量前10 */}
        {showFeatured && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔥</span>
              <h2 className="text-xl font-bold text-gray-800">热门下载 TOP 10</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {featuredSkills.map((skill, index) => (
                <Link 
                  key={skill.id}
                  href={`/skills/${skill.id}`}
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition hover:border-primary"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-lg font-bold ${index < 3 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {index + 1}
                    </span>
                    <h3 className="font-bold text-gray-800 truncate">{skill.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{skill.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" /> {skill.downloads || 0}
                    </span>
                    <span className="text-gray-400">👤 {getAuthorName(skill)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 技能列表 */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-gray-500 mt-2">加载中...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map(skill => (
              <div key={skill.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-800">{skill.name}</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    #{skill.id}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{skill.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {skill.tags?.slice(0, 4).map((tag: string) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" /> {skill.downloads || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" /> {skill.stars || 0}
                    </span>
                    <span className="text-xs text-gray-400">
                      👤 {getAuthorName(skill)}
                    </span>
                  </div>
                  <Link 
                    href={`/skills/${skill.id}`}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    查看详情 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredSkills.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            没有找到相关技能
          </div>
        )}
      </main>
    </div>
  )
}
