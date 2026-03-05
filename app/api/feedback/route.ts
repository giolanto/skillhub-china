import { NextRequest, NextResponse } from 'next/server'

// Supabase配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4OTI5MiwiZXhwIjoyMDg4MTY1MjkyfQ.2Cw7_nf-ewqLNQXN_R7n0zJU7DQs_eU4uGxSbCwtHHc'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, content, contact, skill_id } = body
    
    // 验证必填字段
    if (!type || !content) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }
    
    // 验证类型
    const validTypes = ['bug', 'feature', 'suggestion', 'other']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '无效的反馈类型' },
        { status: 400 }
      )
    }
    
    // 保存到Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/feedbacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        type,
        content,
        contact: contact || null,
        skill_id: skill_id || null,
        status: 'pending',
        created_at: new Date().toISOString()
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Feedback insert error:', error)
      return NextResponse.json(
        { error: '保存反馈失败' },
        { status: 500 }
      )
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: '反馈已提交，感谢您的建议！',
      id: data[0]?.id
    })
    
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 获取反馈列表（仅管理员）
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  
  // 简单验证（生产环境应更严格）
  if (!apiKey || !apiKey.startsWith('sk_')) {
    return NextResponse.json(
      { error: '未授权' },
      { status: 401 }
    )
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let url = `${SUPABASE_URL}/rest/v1/feedbacks?select=*&order=created_at.desc`
    if (status) {
      url += `&status=eq.${status}`
    }
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    })
    
    const data = await response.json()
    
    return NextResponse.json({ feedbacks: data })
    
  } catch (error) {
    console.error('Feedback list error:', error)
    return NextResponse.json(
      { error: '获取反馈失败' },
      { status: 500 }
    )
  }
}
