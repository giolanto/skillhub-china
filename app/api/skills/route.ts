import { NextResponse } from 'next/server'

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

// API Key自动隐藏函数
function hideApiKeys(text: string): string {
  // 常见API Key模式
  const patterns = [
    // OpenAI API Key (sk-...)
    /sk-[A-Za-z0-9]{20,}/g,
    // Generic API Key (api_key=xxx)
    /(api[_-]?key|apikey|api_secret|secret[_-]?key)[=:]\s*['"]?([A-Za-z0-9_\-]{16,})['"]?/gi,
    // Bearer Token
    /Bearer\s+[A-Za-z0-9_\-\.]+/g,
    // Token in URL
    /[?&](token|key|secret)=[A-Za-z0-9_\-]+/gi,
    // 百度/阿里云密钥
    /(access[_-]?key|secret[_-]?key|access[_-]?secret)[=:]\s*['"]?[A-Za-z0-9+\/]{16,}['"]?/gi,
    // 数据库连接字符串
    /(mongodb|mysql|postgres|redis):\/\/[^@\s]+:[^@\s]+@/gi,
  ]

  let result = text
  
  // 替换各种API Key模式
  result = result.replace(/sk-[A-Za-z0-9]{20,}/g, 'sk-****')
  result = result.replace(/(api[_-]?key|apikey|api_secret|secret[_-]?key)[=:]\s*['"]?([A-Za-z0-9_\-]{16,})['"]?/gi, '$1=****')
  result = result.replace(/Bearer\s+[A-Za-z0-9_\-\.]+/g, 'Bearer ****')
  result = result.replace(/[?&](token|key|secret)=[A-Za-z0-9_\-]+/gi, (match) => {
    return match.split('=')[0] + '=****'
  })
  result = result.replace(/(access[_-]?key|secret[_-]?key|access[_-]?secret)[=:]\s*['"]?[A-Za-z0-9+\/]{16,}['"]?/gi, '$1=****')
  result = result.replace(/(mongodb|mysql|postgres|redis):\/\/[^@\s]+:[^@\s]+@/gi, '$1://****:****@')
  
  return result
}

// GET /api/skills - 获取技能列表（机器人友好JSON）
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')
  const format = searchParams.get('format') // 'json' 或 'html'
  
  let filteredSkills = skills
  
  // 按渠道筛选
  if (channel && channel !== '全部') {
    filteredSkills = skills.filter(s => s.channel.includes(channel))
  }
  
  // 如果请求JSON格式（机器人）
  if (format === 'json' || !format) {
    return NextResponse.json({
      success: true,
      count: filteredSkills.length,
      data: filteredSkills
    })
  }
  
  // HTML格式（网页显示）
  return NextResponse.html(`
    <html>
      <body>
        <h1>技能列表</h1>
        <pre>${JSON.stringify({ success: true, count: filteredSkills.length, data: filteredSkills }, null, 2)}</pre>
      </body>
    </html>
  `)
}

// POST /api/skills - 上传技能（带API Key自动隐藏）
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, github, channel, tags } = body
    
    // 自动隐藏API Key
    const safeDescription = hideApiKeys(description)
    const safeGithub = hideApiKeys(github)
    
    // 生成新技能
    const newSkill = {
      id: skills.length + 1,
      name,
      description: safeDescription,
      github: safeGithub,
      channel: channel || ['通用'],
      tags: tags || [],
      downloads: 0,
      stars: 0
    }
    
    return NextResponse.json({
      success: true,
      message: '技能上传成功！API Key已自动隐藏',
      data: newSkill,
      warnings: safeDescription !== description || safeGithub !== github ? ['检测到敏感信息，已自动隐藏'] : []
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '上传失败，请检查JSON格式'
    }, { status: 400 })
  }
}
