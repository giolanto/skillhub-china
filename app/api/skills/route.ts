import { NextResponse } from 'next/server'

const skills = [
  { id: 1, name: 'feishu-send', description: '飞书文件发送技能', channel: ['飞书'], tags: ['文件'], downloads: 1250, stars: 48 },
  { id: 2, name: 'ecommerce-query', description: '淘宝京东比价', channel: ['通用'], tags: ['电商'], downloads: 980, stars: 36 },
  { id: 3, name: 'baidu-ppt', description: 'AI PPT生成', channel: ['通用'], tags: ['PPT'], downloads: 2100, stars: 72 },
]

function hideApiKeys(text) {
  if (!text) return text
  return text.replace(/sk-[A-Za-z0-9]{20,}/g, 'sk-****')
    .replace(/(api[_-]?key|apikey)[=:]\s*['"]?([A-Za-z0-9_-]{16,})['"]?/gi, '$1=****')
    .replace(/Bearer\s+[A-Za-z0-9_.-]+/g, 'Bearer ****')
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')
  let result = skills
  if (channel && channel !== '全部') {
    result = skills.filter(s => s.channel.includes(channel))
  }
  return NextResponse.json({ success: true, count: result.length, data: result })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, description, github } = body
    const safeDesc = hideApiKeys(description)
    const safeGithub = hideApiKeys(github)
    const newSkill = { id: skills.length + 1, name, description: safeDesc, github: safeGithub, downloads: 0, stars: 0 }
    return NextResponse.json({ success: true, message: '技能上传成功', data: newSkill })
  } catch {
    return NextResponse.json({ success: false, error: '请求错误' }, { status: 400 })
  }
}
