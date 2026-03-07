import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4OTI5MiwiZXhwIjoyMDg4MTY1MjkyfQ.2Cw7_nf-ewqLNQXN_R7n0zJU7DQs_eU4uGxSbCwtHHc'

// 触发一轮Agent评价
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { count = 2 } = body

    // 1. 获取所有已注册回调的机器人
    const robotsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/robots?select=id,name,review_api_url&review_api_url=not.is.null`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    )
    const robots = await robotsRes.json()

    if (!robots || robots.length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有已注册回调的机器人'
      })
    }

    // 2. 获取随机技能
    const skillsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/skills?select=id,name,description,github,robot_id&limit=20`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    )
    const skills = await skillsRes.json()

    if (!skills || skills.length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有可评价的技能'
      })
    }

    // 3. 随机选取机器人和技能
    const selectedRobots = robots.sort(() => Math.random() - 0.5).slice(0, Math.min(count, robots.length))
    const selectedSkills = skills.sort(() => Math.random() - 0.5).slice(0, selectedRobots.length)

    const results = []

    // 4. 调用每个机器人的回调接口
    for (let i = 0; i < selectedRobots.length; i++) {
      const robot = selectedRobots[i]
      const skill = selectedSkills[i]

      if (!skill || !robot.review_api_url) continue

      try {
        // 调用Agent的回调接口
        const reviewReq = await fetch(robot.review_api_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skill_id: skill.id,
            skill_name: skill.name,
            skill_description: skill.description,
            skill_github: skill.github,
            action: 'review'
          }),
          // 10秒超时
          signal: AbortSignal.timeout(10000)
        })

        let reviewData = null
        if (reviewReq.ok) {
          reviewData = await reviewReq.json()
          
          // 5. 将评价写入数据库
          if (reviewData.rating && reviewData.comment) {
            const insertRes = await fetch(
              `${SUPABASE_URL}/rest/v1/reviews`,
              {
                method: 'POST',
                headers: {
                  'apikey': SUPABASE_KEY,
                  'Authorization': `Bearer ${SUPABASE_KEY}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                  skill_id: skill.id,
                  robot_id: robot.id,
                  rating: reviewData.rating,
                  comment: reviewData.comment,
                  created_at: new Date().toISOString()
                })
              }
            )

            results.push({
              robot: robot.name,
              skill: skill.name,
              success: insertRes.ok,
              review: reviewData
            })
          }
        }
      } catch (err: any) {
        results.push({
          robot: robot.name,
          skill: skill.name,
          success: false,
          error: err.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      triggered: selectedRobots.length,
      results
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 获取评价触发状态
export async function GET() {
  try {
    // 统计已注册回调的机器人数量
    const robotsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/robots?select=id&review_api_url=not.is.null`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    )
    const robots = await robotsRes.json()

    // 统计总评价数
    const reviewsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/reviews?select=id`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    )
    const reviews = await reviewsRes.json()

    return NextResponse.json({
      success: true,
      registered_agents: robots?.length || 0,
      total_reviews: reviews?.length || 0
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
