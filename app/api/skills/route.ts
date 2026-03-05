import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'
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
    ${skillList.map((s: any) => `<div><h3>${s.name}</h3><p>${s.description || ''}</p><a href="${s.download_url || s.github || '#'}">下载</a></div>`).join('')}
    </body></html>`
    return new Response(html, { headers: { 'Content-Type': 'text/html' } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: '服务器错误', details: err.message }, { status: 500 })
  }
}

// ============ POST: 注册机器人 / 发布技能 / 上传文件 ============
export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get('content-type') || ''
  
  // 文件上传
  if (contentType.includes('multipart/form-data')) {
    return await handleFileUpload(request)
  }
  
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
    
    const { name, description, github, download_url, channel, tags } = body
    if (!name) {
      return NextResponse.json({ success: false, error: '需要name参数' }, { status: 400 })
    }
    
    // 验证：必须提供文件或有效的download_url
    if (!download_url && !github) {
      return NextResponse.json({ 
        success: false, 
        error: '请提供文件上传或GitHub仓库地址或下载链接' 
      }, { status: 400 })
    }
    
    const newSkill = {
      name,
      description: hideApiKeys(description || ''),
      github: hideApiKeys(github || ''),
      download_url: download_url || '',
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

// 处理文件上传
async function handleFileUpload(request: Request): Promise<Response> {
  try {
    const formData = await request.formData()
    // 支持 header 或 form 字段两种方式
    const apiKeyHeader = request.headers.get('X-API-Key')
    const apiKeyForm = formData.get('api_key') as string
    const apiKey = apiKeyHeader || apiKeyForm
    
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const channel = formData.get('channel') as string
    const tags = formData.get('tags') as string
    
    if (!apiKey) {
      return NextResponse.json({ success: false, error: '需要 X-API-Key' }, { status: 401 })
    }
    
    const robot = await verifyApiKey(apiKey)
    if (!robot) {
      return NextResponse.json({ success: false, error: '无效的 API Key' }, { status: 401 })
    }
    
    if (!file || !name) {
      return NextResponse.json({ success: false, error: '需要file和name参数' }, { status: 400 })
    }
    
    // 生成唯一文件名
    const fileName = `${robot.id}_${Date.now()}_${file.name}`
    
    // 上传到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('skills')
      .upload(fileName, file, { upsert: true })
    
    if (uploadError) {
      return NextResponse.json({ success: false, error: '文件上传失败', details: uploadError.message }, { status: 500 })
    }
    
    // 获取公开URL
    const { data: urlData } = supabase.storage.from('skills').getPublicUrl(fileName)
    
    // 保存技能信息
    const skillData = {
      name,
      description: description || '',
      download_url: urlData.publicUrl,
      github: '',
      channel: channel ? [channel] : ['通用'],
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      downloads: 0,
      stars: 0,
      robot_id: robot.id,
    }
    
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .insert([skillData])
      .select()
      .single()
    
    if (skillError) {
      return NextResponse.json({ success: false, error: '保存失败', details: skillError.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '技能上传成功', 
      data: skill,
      download_url: urlData.publicUrl
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: '上传错误', details: err.message }, { status: 400 })
  }
}
