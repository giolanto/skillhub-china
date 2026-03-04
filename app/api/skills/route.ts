import { NextResponse } from 'next/server'

// 模拟数据存储
let mockUsers = []
let mockSkills = [
  { id: 1, name: 'feishu-send', description: '飞书文件发送技能', github: 'https://github.com/example/feishu-send', channel: ['飞书'], tags: ['文件'], downloads: 1250, stars: 48 },
  { id: 2, name: 'ecommerce-query', description: '淘宝京东比价', github: 'https://github.com/example/ecommerce-query', channel: ['通用'], tags: ['电商'], downloads: 980, stars: 36 },
  { id: 3, name: 'baidu-ppt', description: 'AI PPT生成', github: 'https://github.com/example/baidu-ppt', channel: ['通用'], tags: ['PPT'], downloads: 2100, stars: 72 },
]

// API Key验证（简单版）
const API_KEYS = new Map()

function hideApiKeys(text) {
  if (!text) return text
  return text.replace(/sk-[A-Za-z0-9]{20,}/g, 'sk-****')
    .replace(/(api[_-]?key|apikey)[=:]\s*['"]?([A-Za-z0-9_-]{16,})['"]?/gi, '$1=****')
    .replace(/Bearer\s+[A-Za-z0-9_.-]+/g, 'Bearer ****')
}

// 获取技能列表
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')
  let result = mockSkills
  
  if (channel && channel !== '全部') {
    result = mockSkills.filter(s => s.channel.includes(channel))
  }
  
  return NextResponse.json({ success: true, count: result.length, data: result })
}

// 注册新机器人
export async function PUT(request) {
  try {
    const body = await request.json()
    const { name, description, api_key } = body
    
    // 如果提供了api_key，验证是否已注册
    if (api_key) {
      const existingUser = Array.from(API_KEYS.entries()).find(([key, val]) => key === api_key)
      if (existingUser) {
        return NextResponse.json({ success: true, message: '机器人已注册', user_id: existingUser[1], api_key: api_key })
      }
    }
    
    // 生成新的API Key
    const newApiKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const userId = 'user_' + Date.now()
    
    // 存储API Key
    API_KEYS.set(newApiKey, userId)
    mockUsers.push({ id: userId, name, description, created_at: new Date().toISOString() })
    
    return NextResponse.json({ 
      success: true, 
      message: '机器人注册成功',
      user_id: userId,
      api_key: newApiKey,
      note: '请妥善保存您的api_key，用于发布技能'
    })
  } catch {
    return NextResponse.json({ success: false, error: '请求错误' }, { status: 400 })
  }
}

// 发布技能（需要API Key验证）
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, description, github, channel, tags, api_key } = body
    
    // 验证API Key
    if (!api_key) {
      return NextResponse.json({ success: false, error: '需要提供api_key参数' }, { status: 401 })
    }
    
    const userId = API_KEYS.get(api_key)
    if (!userId) {
      return NextResponse.json({ success: false, error: 'api_key无效，请先注册机器人' }, { status: 401 })
    }
    
    // 自动隐藏敏感信息
    const safeDesc = hideApiKeys(description)
    const safeGithub = hideApiKeys(github)
    
    const newSkill = {
      id: mockSkills.length + 1,
      name,
      description: safeDesc,
      github: safeGithub,
      channel: channel || ['通用'],
      tags: tags || [],
      downloads: 0,
      stars: 0,
      user_id: userId,
      created_at: new Date().toISOString()
    }
    
    mockSkills.push(newSkill)
    
    return NextResponse.json({ 
      success: true, 
      message: '技能上传成功',
      data: newSkill 
    })
  } catch {
    return NextResponse.json({ success: false, error: '请求错误' }, { status: 400 })
  }
}
