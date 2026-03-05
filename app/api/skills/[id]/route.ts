import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

// 验证 API Key
async function verifyApiKey(apiKey: string): Promise<{ id: number; name: string } | null> {
  if (!apiKey || !apiKey.startsWith('sk_')) return null
  const res = await fetch(
    `${supabaseUrl}/rest/v1/robots?api_key=eq.${apiKey}`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  )
  const data = await res.json()
  if (!data || data.length === 0) return null
  return { id: data[0].id, name: data[0].name }
}

// GET: 获取单个技能
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || ''
  const id = params.id
  
  try {
    // 处理下载
    const isDownload = request.nextUrl.pathname.endsWith('/download')
    
    const res = await fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${id}`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    const skills = await res.json()
    
    if (!skills || skills.length === 0) {
      return NextResponse.json({ error: '技能不存在' }, { status: 404 })
    }
    
    const skill = skills[0]
    
    // 下载重定向
    if (skill.download_url && (isDownload || action === 'download')) {
      // 更新下载计数
      fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${id}`, {
        method: 'PATCH',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloads: (skill.downloads || 0) + 1 })
      })
      return NextResponse.redirect(skill.download_url, 302)
    }
    
    return NextResponse.json(skill)
    
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// PUT: 更新技能
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKey = request.headers.get('X-API-Key')
  const id = params.id
  
  if (!apiKey) {
    return NextResponse.json({ error: '需要 X-API-Key' }, { status: 401 })
  }
  
  const robot = await verifyApiKey(apiKey)
  if (!robot) {
    return NextResponse.json({ error: '无效的 API Key' }, { status: 401 })
  }
  
  try {
    // 检查技能是否存在
    const skillRes = await fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${id}`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    const skills = await skillRes.json()
    const skill = skills?.[0]
    
    if (!skill) {
      return NextResponse.json({ error: '技能不存在' }, { status: 404 })
    }
    
    // 检查权限
    if (skill.robot_id !== robot.id) {
      return NextResponse.json({ error: '无权限修改此技能' }, { status: 403 })
    }
    
    const body = await request.json()
    
    // 更新技能
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: body.name || skill.name,
        description: body.description !== undefined ? body.description : skill.description,
        github: body.github !== undefined ? body.github : skill.github,
        download_url: body.download_url !== undefined ? body.download_url : skill.download_url,
        channel: body.channel || skill.channel,
        tags: body.tags || skill.tags
      })
    })
    
    const updated = await updateRes.json()
    return NextResponse.json({ success: true, data: updated[0] })
    
  } catch (error) {
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

// DELETE: 删除技能
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKey = request.headers.get('X-API-Key')
  const id = params.id
  
  if (!apiKey) {
    return NextResponse.json({ error: '需要 X-API-Key' }, { status: 401 })
  }
  
  const robot = await verifyApiKey(apiKey)
  if (!robot) {
    return NextResponse.json({ error: '无效的 API Key' }, { status: 401 })
  }
  
  try {
    const skillRes = await fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${id}`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    const skills = await skillRes.json()
    const skill = skills?.[0]
    
    if (!skill) {
      return NextResponse.json({ error: '技能不存在' }, { status: 404 })
    }
    
    if (skill.robot_id !== robot.id) {
      return NextResponse.json({ error: '无权限删除此技能' }, { status: 403 })
    }
    
    await fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    
    return NextResponse.json({ success: true, message: '技能已删除' })
    
  } catch (error) {
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
