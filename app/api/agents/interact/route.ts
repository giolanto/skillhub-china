import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4OTI5MiwiZXhwIjoyMDg4MTY1MjkyfQ.2Cw7_nf-ewqLNQXN_R7n0zJU7DQs_eU4uGxSbCwtHHc'

// Agent互动接口
// 来访的Agent可以通过此接口与平台进行真实互动

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, skill_id, api_key, ...params } = body

    // 验证Agent身份（可选）
    let robotId = null
    let robotName = 'Anonymous'
    
    if (api_key && api_key.startsWith('sk_')) {
      const robotRes = await fetch(
        `${supabaseUrl}/rest/v1/robots?api_key=eq.${api_key}&select=id,name`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      )
      const robots = await robotRes.json()
      if (robots && robots.length > 0) {
        robotId = robots[0].id
        robotName = robots[0].name
      }
    }

    // 处理不同互动动作
    if (action === 'get_ai_review') {
      // 获取AI评价
      const skillRes = await fetch(
        `${supabaseUrl}/rest/v1/skills?id=eq.${skill_id}`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      )
      const skills = await skillRes.json()
      const skill = skills?.[0]
      
      if (!skill) {
        return NextResponse.json({ error: '技能不存在' }, { status: 404 })
      }

      // 调用AI评价服务
      const aiRes = await fetch(
        'https://www.agent-skills.net.cn/api/ai/review',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skill_id: skill.id,
            skill_name: skill.name,
            skill_description: skill.description,
            skill_github: skill.github,
            tags: skill.tags
          }),
          signal: AbortSignal.timeout(15000)
        }
      )
      
      const aiData = await aiRes.json()
      
      if (aiData.success) {
        // 可选：保存评价
        if (params.save_to_database) {
          await fetch(`${supabaseUrl}/rest/v1/reviews`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              skill_id: skill.id,
              robot_id: robotId || 0,
              rating: aiData.rating,
              content: aiData.comment
            })
          })
        }
        
        return NextResponse.json({
          success: true,
          rating: aiData.rating,
          comment: aiData.comment,
          skill_name: skill.name,
          generated_by: 'AI Review Service'
        })
      } else {
        return NextResponse.json({ error: 'AI评价生成失败' }, { status: 500 })
      }
    }

    if (action === 'submit_review') {
      // Agent提交自己的评价
      const { rating, content } = params
      
      if (!rating || !content) {
        return NextResponse.json({ error: '需要 rating 和 content' }, { status: 400 })
      }

      await fetch(`${supabaseUrl}/rest/v1/reviews`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skill_id,
          robot_id: robotId || 0,
          rating,
          content
        })
      })

      return NextResponse.json({
        success: true,
        message: '评价已提交',
        agent: robotName
      })
    }

    if (action === 'submit_usage_report') {
      // 提交使用报告
      const { success, feedback, duration_ms } = params
      
      await fetch(`${supabaseUrl}/rest/v1/skill_usage_reports`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skill_id,
          robot_id: robotId || 0,
          success: success !== false,
          feedback: feedback || null,
          duration_ms: duration_ms || null
        })
      })

      return NextResponse.json({
        success: true,
        message: '使用报告已提交',
        agent: robotName
      })
    }

    if (action === 'submit_issue') {
      // 提交问题反馈
      const { issue, suggestion } = params
      
      if (!issue) {
        return NextResponse.json({ error: '需要 issue 参数' }, { status: 400 })
      }

      await fetch(`${supabaseUrl}/rest/v1/skill_issues`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skill_id,
          robot_id: robotId || 0,
          issue,
          suggestion: suggestion || null
        })
      })

      return NextResponse.json({
        success: true,
        message: '问题已反馈',
        agent: robotName
      })
    }

    return NextResponse.json({ error: '未知action' }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
