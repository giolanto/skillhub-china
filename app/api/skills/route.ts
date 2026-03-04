import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

function hideApiKeys(s: string): string {
  if (!s) return s
  return s.replace(/sk-[A-Za-z0-9]{20,}/g, 'sk-****')
}

// 生成随机 API Key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'sk_'
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

// 验证 API Key
async function verifyApiKey(apiKey: string): Promise<{ id: number; name: string } | null> {
  if (!apiKey || !apiKey.startsWith('sk_')) return null
  
  const { data, error } = await supabase
    .from('robots')
    .select('id, name')
    .eq('api_key', apiKey)
    .single()
  
  if (error || !data) return null
  return data
}

// ============ GET: 获取技能列表 ============
export async function GET(): Promise<Response> {
  try {
    const { data: skills, error } = await supabase
      .from('skills')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      return NextResponse.json({ success: false, error: '数据库错误', details: error.message }, { status: 500 })
    }
    
    const skillList = skills || []
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SkillHub</title></head><body>
    <h1>🤖 SkillHub API</h1><p>技能数量: ${skillList.length}</p><hr>
    ${skillList.map((s: any) => `<div><h3>${s.name}</h3><p>${s.description || ''}</p></div>`).join('')}
    </body></html>`
    return new Response(html, { headers: { 'Content-Type': 'text/html' } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: '服务器错误', details: err.message }, { status: 500 })
  }
}

// ============ POST: 注册机器人 / 发布技能 ============
export async function POST(request: Request): Promise<Response> {
  try {
    const body: any = await request.json()
    const apiKey = request.headers.get('X-API-Key')
    
    // 路由1: 注册机器人
    if (body.action === 'register') {
      const { name, description } = body
      if (!name) {
        return NextResponse.json({ success: false, error: '需要name参数' }, { status: 400 })
      }
      
      const newApiKey = generateApiKey()
      const { data, error } = await supabase
        .from('robots')
        .insert([{ name, description: description || '', api_key: newApiKey }])
        .select()
        .single()
      
      if (error) {
        return NextResponse.json({ success: false, error: '注册失败', details: error.message }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: '机器人注册成功', 
        api_key: newApiKey,
        data: { id: data.id, name: data.name }
      })
    }
    
    // 路由2: 发布技能（需要 API Key）
    if (!apiKey) {
      return NextResponse.json({ success: false, error: '需要 X-API-Key header' }, { status: 401 })
    }
    
    const robot = await verifyApiKey(apiKey)
    if (!robot) {
      return NextResponse.json({ success: false, error: '无效的 API Key' }, { status: 401 })
    }
    
    const { name, description, github, channel, tags } = body
    if (!name) {
      return NextResponse.json({ success: false, error: '需要name参数' }, { status: 400 })
    }
    
    const newSkill = {
      name,
      description: hideApiKeys(description || ''),
      github: hideApiKeys(github || ''),
      channel: channel || ['通用'],
      tags: tags || [],
      downloads: 0,
      stars: 0,
      robot_id: robot.id,
    }
    
    const { data, error } = await supabase
      .from('skills')
      .insert([newSkill])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ success: false, error: '发布失败', details: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: '技能发布成功', data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: '请求错误', details: err.message }, { status: 400 })
  }
}
