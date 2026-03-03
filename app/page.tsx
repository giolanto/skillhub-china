import { Search, Github, MessageCircle, Phone, Download, Star, Tag, ArrowRight, Send } from 'lucide-react'

// 模拟技能数据（后续从数据库获取）
const skills = [
  {
    id: 1,
    name: 'feishu-send',
    description: '飞书文件/图片发送技能，支持多种文件格式',
    channel: ['飞书'],
    tags: ['文件传输', '飞书'],
    downloads: 1250,
    stars: 48,
    github: 'https://github.com/example/feishu-send'
  },
  {
    id: 2,
    name: 'ecommerce-query',
    description: '淘宝/京东商品价格查询，比价神器',
    channel: ['通用'],
    tags: ['电商', '比价'],
    downloads: 980,
    stars: 36,
    github: 'https://github.com/example/ecommerce-query'
  },
  {
    id: 3,
    name: 'baidu-ppt',
    description: '百度千帆AI PPT生成，一键生成演示文稿',
    channel: ['通用'],
    tags: ['PPT', 'AI生成'],
    downloads: 2100,
    stars: 72,
    github: 'https://github.com/example/baidu-ppt'
  },
  {
    id: 4,
    name: 'browser-ops',
    description: '浏览器自动化操作，模拟人工操作',
    channel: ['通用'],
    tags: ['自动化', '浏览器'],
    downloads: 856,
    stars: 29,
    github: 'https://github.com/example/browser-ops'
  },
  {
    id: 5,
    name: 'model-switch',
    description: '多模型切换，根据任务自动选择最优模型',
    channel: ['通用'],
    tags: ['模型', '切换'],
    downloads: 1560,
    stars: 61,
    github: 'https://github.com/example/model-switch'
  },
  {
    id: 6,
    name: 'wechat-bot',
    description: '微信机器人基础技能，支持消息处理',
    channel: ['微信'],
    tags: ['微信', '消息'],
    downloads: 720,
    stars: 24,
    github: 'https://github.com/example/wechat-bot'
  }
]

const channels = ['全部', '飞书', '微信', '钉钉', 'Telegram', '通用']

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-primary">
              S
            </div>
            <span className="text-xl font-bold">SkillHub China</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#skills" className="hover:text-accent transition">技能</a>
            <a href="#about" className="hover:text-accent transition">关于</a>
            <a 
              href="https://github.com" 
              target="_blank"
              className="flex items-center gap-1 hover:text-accent transition"
            >
              <Github size={18} />
              GitHub
            </a>
            <a 
              href="/upload"
              className="flex items-center gap-1 bg-accent text-primary px-4 py-2 rounded-lg hover:opacity-90 transition font-medium"
            >
              <Send size={16} />
              上传技能
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            国人自己的AI Agent技能市场
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            专注于OpenClaw生态 • 飞书/微信/钉钉/Telegram渠道 • 中文场景
          </p>
          
          {/* 搜索框 */}
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="flex-1 flex items-center bg-white rounded-lg px-4 py-3">
              <Search className="text-gray-400 mr-2" size={20} />
              <input 
                type="text" 
                placeholder="搜索技能..." 
                className="flex-1 outline-none text-gray-700"
              />
            </div>
            <button className="bg-accent text-primary font-bold px-6 py-3 rounded-lg hover:opacity-90 transition">
              搜索
            </button>
          </div>
          
          <div className="mt-8 flex justify-center gap-4 text-sm text-blue-100">
            <span>🔥 6个精选技能</span>
            <span>📦 持续更新中</span>
            <span>🚀 一键安装</span>
          </div>
        </div>
      </section>

      {/* 渠道标签 */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4 overflow-x-auto">
          {channels.map((channel) => (
            <button
              key={channel}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                channel === '全部' 
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">精选技能</h2>
          <span className="text-gray-500">共 {skills.length} 个技能</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <div 
              key={skill.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                    {skill.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{skill.name}</h3>
                    <p className="text-xs text-gray-500">{skill.channel.join(', ')}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {skill.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {skill.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Download size={14} />
                    {skill.downloads}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" />
                    {skill.stars}
                  </span>
                </div>
                <a 
                  href={skill.github}
                  target="_blank"
                  className="flex items-center gap-1 text-secondary hover:underline text-sm"
                >
                  查看 <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 关于 */}
      <section id="about" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">关于 SkillHub China</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="text-primary" size={32} />
              </div>
              <h3 className="font-bold mb-2">开源技能</h3>
              <p className="text-gray-600 text-sm">
                收录优质的AI Agent技能，兼容OpenClaw生态
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-green-600" size={32} />
              </div>
              <h3 className="font-bold mb-2">国内渠道</h3>
              <p className="text-gray-600 text-sm">
                专注飞书、微信、钉钉等国内主流IM渠道
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="text-accent" size={32} />
              </div>
              <h3 className="font-bold mb-2">一键安装</h3>
              <p className="text-gray-600 text-sm">
                支持GitHub拉取和OpenClaw直接安装
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">© 2026 SkillHub China. All rights reserved.</p>
          <p className="text-sm">
            Made with ❤️ for Chinese AI Developers
          </p>
        </div>
      </footer>
    </div>
  )
}
