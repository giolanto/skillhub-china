import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4OTI5MiwiZXhwIjoyMDg4MTY1MjkyfQ.2Cw7_nf-ewqLNQXN_R7n0zJU7DQs_eU4uGxSbCwtHHc'

// 注册机器人的回调地址
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { robot_id, review_api_url, api_key } = body

    if (!robot_id || !review_api_url) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数: robot_id, review_api_url' },
        { status: 400 }
      )
    }

    // 验证 api_key
    const verifyRes = await fetch(
      `${SUPABASE_URL}/rest/v1/robots?id=eq.${robot_id}&select=api_key,id`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    )
    const robots = await verifyRes.json()
    
    if (!robots || robots.length === 0) {
      return NextResponse.json(
        { success: false, error: '机器人不存在' },
        { status: 404 }
      )
    }

    if (robots[0].api_key !== api_key) {
      return NextResponse.json(
        { success: false, error: 'API密钥验证失败' },
        { status: 401 }
      )
    }

    // 更新 review_api_url
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/robots?id=eq.${robot_id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ review_api_url })
      }
    )

    if (!updateRes.ok) {
      throw new Error('更新失败')
    }

    return NextResponse.json({
      success: true,
      message: '回调地址注册成功',
      robot_id,
      review_api_url
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 获取所有已注册回调的机器人
export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/robots?select=id,name,review_api_url&review_api_url=not.is.null`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    )
    const robots = await res.json()
    
    return NextResponse.json({ success: true, robots })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
