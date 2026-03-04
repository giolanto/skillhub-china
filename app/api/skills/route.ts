import { NextResponse } from 'next/server'

// 模拟数据存储（Vercel serverless会保留在内存中）
let skills = [
  { id: 1, name: 'feishu-send', description: '飞书文件发送技能', github: 'https://github.com/example/feishu-send', channel: ['飞书'], tags: ['文件'], downloads: 1250, stars: 48 },
  { id: 2, name: 'ecommerce-query', description: '淘宝京东比价', github: 'https://github.com/example/ecommerce-query', channel: ['通用'], tags: ['电商'], downloads: 980, stars: 36 },
  { id: 3, name: 'baidu-ppt', description: 'AI PPT生成', github: 'https://github.com/example/baidu-ppt', channel: ['通用'], tags: ['PPT'], downloads: 2100, stars: 72 },
]

function hideApiKeys(text) {
  if (!text) return text
  return text.replace(/sk-[A-Za-z0-9]{20,}/g, 'sk-****')
    .replace(/(api[_-]?key|apikey)[=:]\s*['"]?([A-Za-z0-9_-]{16,})['"]?/gi, '$1=****')
    .replace(/Bearer\s+[A-Za-z0-9_.-]+/g, 'Bearer ****')
}

// GET: 获取技能列表
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')
  let result = skills
  
  if (channel && channel !== '全部') {
    result = skills.filter(s => s.channel.includes(channel))
  }
  
  // HTML格式
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SkillHub API - 技能列表</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    h1 { color: #003366; }
    .skill { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .skill h3 { margin: 0 0 10px; color: #0066cc; }
    .tag { background: #e0e0e0; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 5px; }
    .stats { color: #666; font-size: 14px; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>🤖 SkillHub API</h1>
  <p>技能数量: ${result.length}</p>
  <hr>
  ${result.map(s => `<div class="skill">
    <h3>${s.name}</h3>
    <p>${s.description}</p>
    <div class="tags">${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    <div class="stats">⬇️ ${s.downloads} | ⭐ ${s.stars}</div>
  </div>`).join('')}
  <hr>
  <p><a href="/api/skills?format=json">JSON格式</a> | <a href="/api/skills?format=html">HTML格式</a></p>
</body>
</html>`
  
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

// POST: 发布技能（简化版：直接发布，无需验证）
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, description, github, channel, tags } = body
    
    // 简化验证：只需要有name即可发布
    if (!name) {
      return NextResponse.json({ success: false, error: '需要提供name参数' }, { status: 400 })
    }
    
    // 自动隐藏敏感信息
    const safeDesc = hideApiKeys(description || '')
    const safeGithub = hideApiKeys(github || '')
    
    const newSkill = {
      id: skills.length + 1,
      name,
      description: safeDesc,
      github: safeGithub,
      channel: channel || ['通用'],
      tags: tags || [],
      downloads: 0,
      stars: 0,
      created_at: new Date().toISOString()
    }
    
    skills.push(newSkill)
    
    return NextResponse.json({ 
      success: true, 
      message: '技能发布成功',
      data: newSkill 
    })
  } catch {
    return NextResponse.json({ success: false, error: '请求错误' }, { status: 400 })
  }
}
