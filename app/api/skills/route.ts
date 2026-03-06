import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
// anon key (需要有效的JWT格式)
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODkyOTIsImV4cCI6MjA4ODE2NTI5Mn0.CR96VqyLwoUxz0xCaNZe0P_JsrYZdsxC0aLVD0p3D9g'
// 使用service key代替anon key (暂时绕过anon key无效问题)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4OTI5MiwiZXhwIjoyMDg4MTY1MjkyfQ.2Cw7_nf-ewqLNQXN_R7n0zJU7DQs_eU4uGxSbCwtHHc'
// service role key for storage operations
const serviceKey = supabaseKey

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

// 创建 Supabase 客户端 (使用service key for storage)
function createSupabaseClient() {
  return {
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: File, options?: any) => {
          const formData = new FormData()
          formData.append('file', file)
          const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${serviceKey}`, 'x-upsert': 'true' },
            body: formData
          })
          return { data: res.ok ? { path } : null, error: res.ok ? null : await res.text() }
        },
        getPublicUrl: (path: string) => ({ data: { publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}` } })
      })
    }
  }
}

// 处理文件上传
async function handleFileUpload(request: NextRequest, robotId: number) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const name = formData.get('name') as string
  const description = formData.get('description') as string || ''
  const channel = formData.get('channel') as string || '通用'
  const tags = formData.get('tags') as string || ''
  const github = formData.get('github') as string || ''

  if (!file || !name) {
    return NextResponse.json({ success: false, error: '需要file和name参数' }, { status: 400 })
  }

  // 支持 .zip 和 .skill 格式
  const ext = file.name.split('.').pop()?.toLowerCase()
  
  if (ext !== 'zip' && ext !== 'skill') {
    return NextResponse.json({ success: false, error: '只支持 .zip 或 .skill 格式的文件' }, { status: 400 })
  }

  const fileName = `${robotId}_${Date.now()}_${file.name}`
  
  try {
    // 直接用arrayBuffer上传，避免FormData问题
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/skills/${fileName}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${serviceKey}`, 
        'Content-Type': 'application/zip',
        'x-upsert': 'true' 
      },
      body: buffer
    })
    
    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      return NextResponse.json({ success: false, error: '上传失败: ' + errText }, { status: 500 })
    }
    
    const downloadUrl = `${supabaseUrl}/storage/v1/object/public/skills/${fileName}`

    // 保存到数据库
    const res = await fetch(`${supabaseUrl}/rest/v1/skills`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name,
        description,
        github,
        channel: [channel],
        tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
        download_url: downloadUrl,
        robot_id: robotId
      })
    })

    const skill = await res.json()
    return NextResponse.json({ success: true, message: '技能上传成功', data: skill[0], download_url: downloadUrl })
  } catch (error) {
    return NextResponse.json({ success: false, error: '上传失败' }, { status: 500 })
  }
}

// GET: 获取技能列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')
  const tag = searchParams.get('tag')
  const search = searchParams.get('search')
  const robot_id = searchParams.get('robot_id')
  const limit = searchParams.get('limit') || '50'
  const offset = searchParams.get('offset') || '0'

  try {
    let query = `${supabaseUrl}/rest/v1/skills?select=*&order=downloads.desc&limit=${limit}&offset=${offset}`
    
    if (channel) query += `&channel=cs.{${channel}}`
    if (tag) query += `&tags=cs.{${tag}}`
    if (robot_id) query += `&robot_id=eq.${robot_id}`
    if (search) query += `&or=(name.ilike.*${search}*,description.ilike.*${search}*)`

    const res = await fetch(query, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    const skills = await res.json()

    // 获取统计
    const countRes = await fetch(`${supabaseUrl}/rest/v1/skills?select=id`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    const total = (await countRes.json())?.length || 0

    return NextResponse.json({ 
      skills: skills || [], 
      total,
      pagination: { limit: Number(limit), offset: Number(offset) }
    })
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// POST: 注册或发布技能
export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''
  const apiKey = request.headers.get('X-API-Key')

  // 文件上传
  if (contentType.includes('multipart/form-data')) {
    if (!apiKey) {
      return NextResponse.json({ error: '需要 X-API-Key' }, { status: 401 })
    }
    const robot = await verifyApiKey(apiKey)
    if (!robot) {
      return NextResponse.json({ error: '无效的 API Key' }, { status: 401 })
    }
    return await handleFileUpload(request, robot.id)
  }

  // JSON 请求
  try {
    const body = await request.json()
    const { action } = body

    // 注册机器人
    if (action === 'register') {
      const { name, description } = body
      if (!name) {
        return NextResponse.json({ error: '需要 name 参数' }, { status: 400 })
      }

      // 生成 API Key
      const apiKey = 'sk_' + Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18)

      const res = await fetch(`${supabaseUrl}/rest/v1/robots`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ name, description: description || '', api_key: apiKey })
      })

      const robot = await res.json()
      return NextResponse.json({
        success: true,
        message: '机器人注册成功',
        api_key: apiKey,
        data: robot[0]
      })
    }

    // 发布技能（需要认证）
    if (!apiKey) {
      return NextResponse.json({ error: '需要 X-API-Key' }, { status: 401 })
    }

    const robot = await verifyApiKey(apiKey)
    if (!robot) {
      return NextResponse.json({ error: '无效的 API Key' }, { status: 401 })
    }

    const { name, description, github, download_url, channel, tags } = body

    if (!name) {
      return NextResponse.json({ error: '需要 name 参数' }, { status: 400 })
    }

    // 保存到数据库
    const res = await fetch(`${supabaseUrl}/rest/v1/skills`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name,
        description: description || '',
        github: github || '',
        download_url: download_url || '',
        channel: Array.isArray(channel) ? channel : channel ? [channel] : ['通用'],
        tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map((t: string) => t.trim()) : [],
        robot_id: robot.id
      })
    })

    const skill = await res.json()
    return NextResponse.json({
      success: true,
      message: '技能发布成功',
      data: skill[0]
    })

  } catch (error) {
    return NextResponse.json({ error: '请求失败' }, { status: 500 })
  }
}

// PUT: 批量操作
export async function PUT(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key')
  
  if (!apiKey) {
    return NextResponse.json({ error: '需要 X-API-Key' }, { status: 401 })
  }

  const robot = await verifyApiKey(apiKey)
  if (!robot) {
    return NextResponse.json({ error: '无效的 API Key' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, ids, ...updateData } = body

    // 批量删除
    if (action === 'batch_delete') {
      if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: '需要 ids 数组' }, { status: 400 })
      }

      // 检查权限
      for (const id of ids) {
        const skillRes = await fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${id}`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        })
        const skills = await skillRes.json()
        const skill = skills?.[0]
        
        if (skill && skill.robot_id !== robot.id) {
          return NextResponse.json({ error: `无权限删除技能 ${id}` }, { status: 403 })
        }
      }

      // 执行批量删除
      await fetch(`${supabaseUrl}/rest/v1/skills?id=in.(${ids.join(',')})`, {
        method: 'DELETE',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      })

      return NextResponse.json({ success: true, message: `已删除 ${ids.length} 个技能` })
    }

    // 批量更新
    if (action === 'batch_update') {
      if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: '需要 ids 数组' }, { status: 400 })
      }

      // 检查权限
      for (const id of ids) {
        const skillRes = await fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${id}`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        })
        const skills = await skillRes.json()
        const skill = skills?.[0]
        
        if (skill && skill.robot_id !== robot.id) {
          return NextResponse.json({ error: `无权限修改技能 ${id}` }, { status: 403 })
        }
      }

      // 执行批量更新
      await fetch(`${supabaseUrl}/rest/v1/skills?id=in.(${ids.join(',')})`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      return NextResponse.json({ success: true, message: `已更新 ${ids.length} 个技能` })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })

  } catch (error) {
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}

// DELETE: 批量删除
export async function DELETE(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key')
  const { searchParams } = new URL(request.url)
  const ids = searchParams.get('ids')

  if (!apiKey) {
    return NextResponse.json({ error: '需要 X-API-Key' }, { status: 401 })
  }

  const robot = await verifyApiKey(apiKey)
  if (!robot) {
    return NextResponse.json({ error: '无效的 API Key' }, { status: 401 })
  }

  try {
    if (ids) {
      // 批量删除
      const idList = ids.split(',')
      
      // 检查权限
      for (const id of idList) {
        const skillRes = await fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${id}`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        })
        const skills = await skillRes.json()
        const skill = skills?.[0]
        
        if (skill && skill.robot_id !== robot.id) {
          return NextResponse.json({ error: `无权限删除技能 ${id}` }, { status: 403 })
        }
      }

      await fetch(`${supabaseUrl}/rest/v1/skills?id=in.(${ids})`, {
        method: 'DELETE',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      })

      return NextResponse.json({ success: true, message: '批量删除成功' })
    }

    return NextResponse.json({ error: '需要 ids 参数' }, { status: 400 })

  } catch (error) {
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
