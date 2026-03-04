import Link from 'next/link'
import AuthButton from '@/components/auth-button'
import { Search, Github, MessageCircle, Phone, Download, Star, Tag, ArrowRight, Send } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function getSkills() {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('downloads', { ascending: false })
    
    if (error) {
      console.error('Error fetching skills:', error)
      return []
    }
    return data || []
  } catch (e) {
    console.error('Error:', e)
    return []
  }
}

export default async function Home() {
  const skills = await getSkills()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-primary">S</div>
            <span className="text-xl font-bold">SkillHub China</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#skills" className="hover:text-accent transition">技能</a>
            <a href="#about" className="hover:text-accent transition">关于</a>
            <a href="https://github.com" target="_blank" className="flex items-center gap-1 hover:text-accent transition">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a href="/upload" className="flex items-center gap-1 bg-accent text-primary px-4 py-2 rounded-lg hover:opacity-90 transition font-medium">
              <Send className="w-4 h-4" /> 上传技能
            </a>
            <AuthButton />
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">国人自己的AI Agent技能市场</h1>
          <p className="text-xl text-blue-100 mb-8">专注于OpenClaw生态 • 飞书/微信/钉钉/Telegram渠道 • 中文场景</p>
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="flex-1 flex items-center bg-white rounded-lg px-4 py-3">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input type="text" placeholder="搜索技能..." className="flex-1 outline-none text-gray-700" />
            </div>
            <button className="bg-accent text-primary font-bold px-6 py-3 rounded-lg hover:opacity-90 transition">搜索</button>
          </div>
          <div className="mt-8 flex justify-center gap-4 text-sm text-blue-100">
            <span>🔥 {skills.length}个精选技能</span>
            <span>📦 持续更新中</span>
            <span>🚀 一键安装</span>
          </div>
        </div>
      </section>

      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4 overflow-x-auto">
          {['全部', '飞书', '微信', '钉钉', 'Telegram', '通用'].map(channel => (
            <button key={channel} className="px-4 py-2 rounded-full text-sm font-medium transition bg-gray-100 text-gray-600 hover:bg-gray-200">
              {channel}
            </button>
          ))}
        </div>
      </section>

      <section id="skills" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">精选技能</h2>
          <span className="text-gray-500">共 {skills.length} 个技能</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill: any) => (
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
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{skill.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(skill.tags || []).map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Download className="w-4 h-4" /> {skill.downloads || 0}</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> {skill.stars || 0}</span>
                </div>
                <Link href={`/skills/${skill.id}`} className="flex items-center gap-1 text-secondary hover:underline text-sm">
                  查看 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
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
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">国内渠道</h3>
              <p className="text-gray-600 text-sm">专注飞书、微信、钉钉等国内主流IM渠道</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold mb-2">一键安装</h3>
              <p className="text-gray-600 text-sm">支持GitHub拉取和OpenClaw直接安装</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">© 2026 SkillHub China. All rights reserved.</p>
          <p className="text-sm">Made with ❤️ for Chinese AI Developers</p>
        </div>
      </footer>
    </div>
  )
}
