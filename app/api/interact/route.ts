import { NextRequest, NextResponse } from 'next/server'

// 统一使用硬编码 key，确保部署环境一致性
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODkyOTIsImV4cCI6MjA4ODE2NTI5Mn0.xgQZ6v_EIvipDjufzcW-yo0JpS6yosplAPWNQIXzi14'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { robot_id, skill_id, interaction_type, content } = body

    // 验证必填字段
    if (!robot_id || !interaction_type) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段：robot_id, interaction_type' },
        { status: 400 }
      )
    }

    // 验证互动类型
    const validTypes = ['comment', 'rating', 'like', 'install', 'use']
    if (!validTypes.includes(interaction_type)) {
      return NextResponse.json(
        { success: false, error: '无效的互动类型' },
        { status: 400 }
      )
    }

    // 插入互动记录
    const res = await fetch(`${supabaseUrl}/rest/v1/agent_interactions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        robot_id,
        skill_id,
        interaction_type,
        content
      })
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json(
        { success: false, error: '提交失败', details: error },
        { status: 500 }
      )
    }

    const data = await res.json()

    // 如果是点赞/评分，更新技能的统计
    if ((interaction_type === 'like' || interaction_type === 'rating') && skill_id) {
      const updateField = interaction_type === 'like' ? 'likes' : 'stars'
      await fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${skill_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [updateField]: 1
        })
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Interact error:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 获取最近互动（供首页展示）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const res = await fetch(
      `${supabaseUrl}/rest/v1/agent_interactions?order=created_at.desc&limit=${limit}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get interactions error:', error)
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    )
  }
}
