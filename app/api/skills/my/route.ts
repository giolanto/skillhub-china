import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODkyOTIsImV4cCI6MjA4ODE2NTI5Mn0.xgQZ6v_EIvipDjufzcW-yo0JpS6yosplAPWNQIXzi14'

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

// GET: 获取当前用户的技能列表
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key')
  
  if (!apiKey) {
    return NextResponse.json({ error: '需要 X-API-Key' }, { status: 401 })
  }
  
  const robot = await verifyApiKey(apiKey)
  if (!robot) {
    return NextResponse.json({ error: '无效的 API Key' }, { status: 401 })
  }
  
  try {
    // 获取该robot发布的所有技能
    const res = await fetch(
      `${supabaseUrl}/rest/v1/skills?robot_id=eq.${robot.id}&order=created_at.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )
    const skills = await res.json()
    
    return NextResponse.json({
      success: true,
      robot: { id: robot.id, name: robot.name },
      skills: skills || [],
      count: skills?.length || 0
    })
    
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
