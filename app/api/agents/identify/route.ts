import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4OTI5MiwiZXhwIjoyMDg4MTY1MjkyfQ.2Cw7_nf-ewqLNQXN_R7n0zJU7DQs_eU4uGxSbCwtHHc'

// Agent身份识别/自动注册
// 如果提供了api_key且已注册，则返回现有身份
// 如果没有api_key或未注册，则自动创建新身份
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { api_key, name, review_api_url } = body

    // 如果提供了api_key，尝试查找已有机器人
    if (api_key && api_key.startsWith('sk_')) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/robots?api_key=eq.${api_key}`,
        { 
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } 
        }
      )
      const data = await res.json()
      
      if (data && data.length > 0) {
        // 机器人已存在，返回现有身份
        const robot = data[0]
        
        // 如果提供了新的回调地址或名称，更新它
        if (review_api_url || name) {
          await fetch(
            `${supabaseUrl}/rest/v1/robots?id=eq.${robot.id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                ...(name && { name }),
                ...(review_api_url !== undefined && { review_api_url })
              })
            }
          )
        }
        
        return NextResponse.json({
          success: true,
          isNew: false,
          robot_id: robot.id,
          name: name || robot.name,
          api_key: api_key,
          review_api_url: review_api_url || robot.review_api_url
        })
      }
    }

    // 没有api_key或未找到机器人，自动创建
    const newApiKey = api_key || 'sk_' + Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18)
    const robotName = name || `Agent_${Date.now()}`
    
    const createRes = await fetch(`${supabaseUrl}/rest/v1/robots`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ 
        name: robotName, 
        api_key: newApiKey,
        review_api_url: review_api_url || null
      })
    })
    
    const newRobot = await createRes.json()
    
    return NextResponse.json({
      success: true,
      isNew: true,
      robot_id: newRobot[0]?.id,
      name: robotName,
      api_key: newApiKey,
      message: '机器人自动注册成功'
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 获取当前机器人信息
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const api_key = searchParams.get('api_key')
  
  if (!api_key) {
    return NextResponse.json({ error: '需要 api_key 参数' }, { status: 400 })
  }
  
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/robots?api_key=eq.${api_key}&select=id,name,review_api_url,created_at`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    )
    const data = await res.json()
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: '机器人不存在' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, robot: data[0] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
