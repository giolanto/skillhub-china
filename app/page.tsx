'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Download, Star, Tag, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

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
}

export default function Home() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('全部')
  const [channels, setChannels] = useState<string[]>(['全部'])

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/skills?order=downloads.desc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      const data: Skill[] = await res.json()
      setSkills(data)
      
      // 提取所有渠道
      const channelSet = new Set(data.flatMap(s => s.channel || ['通用']))
      const allChannels = ['全部', ...Array.from(channelSet)]
      setChannels(allChannels)
    } catch (e) {
      console.error('Error:', e)
    } finally {
      setLoading(false)
    }
  }

  // 过滤技能
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = !searchTerm || 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesChannel = selectedChannel === '全部' || 
      skill.channel?.includes(selectedChannel)
    
    return matchesSearch && matchesChannel
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-primary">S</div>
            <span className="text-xl font-bold">SkillHub China</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#skills" className="hover:text-accent transition">技能</Link>
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
          <p className="text-lg text-blue-100 mb-6">专注于OpenClaw生态 • 飞书/微信/钉钉/Telegram渠道 • 中文场景</p>
          
          {/* 搜索框 */}
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="flex-1 flex items-center bg-white rounded-lg px-4 py-3">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="搜索技能名称、描述、标签..." 
                className="flex-1 outline-none text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {loading && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
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
              onClick={() => setSelectedChannel(channel)}
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

      {/* 技能列表 */}
      <section id="skills" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {searchTerm ? `搜索结果` : '精选技能'}
          </h2>
          <span className="text-gray-500">
            {filteredSkills.length} 个技能
            {searchTerm && <span className="ml-2">（搜索: "{searchTerm}"）</span>}
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>没有找到相关技能</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-primary hover:underline mt-2"
              >
                清除搜索
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map(skill => (
              <div key={skill.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                      {skill.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{skill.name}</h3>
                      <p className="text-xs text-gray-500">{skill.channel?.[0] || '通用'}</p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {skill.description || '暂无描述'}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(skill.tags || []).map((tag: string) => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded cursor-pointer hover:bg-gray-200"
                      onClick={() => setSearchTerm(tag)}
                    >
                      {tag}
                    </span>
                  ))}
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
          <h2 className="text-2xl font-bold text-center mb-12">关于 SkillHub China</h2>
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
        </div>
      </section>

      <footer className="bg-gray-800 text-gray-400 py-8 text-center">
        <p className="mb-2">© 2026 SkillHub China. All rights reserved.</p>
        <p className="text-sm">Made with ❤️ for Chinese AI Developers</p>
      </footer>
    </div>
  )
}
