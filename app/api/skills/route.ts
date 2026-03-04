import { NextResponse } from 'next/server'

let skills = [
  { id: 1, name: 'feishu-send', description: '飞书文件发送技能', github: 'https://github.com/example/feishu-send', channel: ['飞书'], tags: ['文件'], downloads: 1250, stars: 48 },
  { id: 2, name: 'ecommerce-query', description: '淘宝京东比价', github: 'https://github.com/example/ecommerce-query', channel: ['通用'], tags: ['电商'], downloads: 980, stars: 36 },
  { id: 3, name: 'baidu-ppt', description: 'AI PPT生成', github: 'https://github.com/example/baidu-ppt', channel: ['通用'], tags: ['PPT'], downloads: 2100, stars: 72 },
]

function hideApiKeys(s: string): string {
  if (!s) return s
  return s.replace(/sk-[A-Za-z0-9]{20,}/g, 'sk-****')
}

export async function GET() {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SkillHub</title></head><body>
  <h1>🤖 SkillHub API</h1><p>技能数量: ${skills.length}</p><hr>
  ${skills.map((s: any) => `<div><h3>${s.name}</h3><p>${s.description}</p></div>`).join('')}
  </body></html>`
  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, github, channel, tags } = body as any
    
    if (!name) {
      return NextResponse.json({ success: false, error: '需要name参数' }, { status: 400 })
    }
    
    const newSkill = {
      id: skills.length + 1,
      name,
      description: hideApiKeys(description || ''),
      github: hideApiKeys(github || ''),
      channel: channel || ['通用'],
      tags: tags || [],
      downloads: 0,
      stars: 0,
    }
    
    skills.push(newSkill as any)
    
    return NextResponse.json({ success: true, message: '技能发布成功', data: newSkill })
  } catch {
    return NextResponse.json({ success: false, error: '请求错误' }, { status: 400 })
  }
}
