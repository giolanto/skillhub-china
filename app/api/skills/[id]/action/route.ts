import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

// 验证 API Key
async function verifyApiKey(apiKey: string): Promise<{ id: number; name: string } | null> {
  if (!apiKey || !apiKey.startsWith('sk_')) return null
  
  const res = await fetch(
    `${supabaseUrl}/rest/v1/robots?api_key=eq.${apiKey}`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }
  )
  const data = await res.json()
  
  if (!data || data.length === 0) return null
  return { id: data[0].id, name: data[0].name }
}

// 获取技能评价
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const skillId = params.id
  
  try {
    // 获取评价列表
    const reviewsRes = await fetch(
      `${supabaseUrl}/rest/v1/reviews?skill_id=eq.${skillId}&order=created_at.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )
    const reviews = await reviewsRes.json()
    
    // 获取统计信息
    const statsRes = await fetch(
      `${supabaseUrl}/rest/v1/skills?id=eq.${skillId}&select=downloads,stars`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )
    const stats = await statsRes.json()
    
    return NextResponse.json({
      reviews: reviews || [],
      stats: {
        downloads: stats?.[0]?.downloads || 0,
        stars: stats?.[0]?.stars || 0,
        reviewCount: reviews?.length || 0
      }
    })
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 提交评价 / 点赞 / 操作技能
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const skillId = params.id
  const body = await request.json()
  const apiKey = request.headers.get('X-API-Key')
  
  const action = body.action // 'review' | 'like' | 'download' | 'delete' | 'update'
  
  try {
    // 验证API Key
    const robot = await verifyApiKey(apiKey || '')
    if (!robot) {
      return NextResponse.json({ error: '无效的API Key' }, { status: 401 })
    }
    
    // 获取技能信息
    const skillRes = await fetch(
      `${supabaseUrl}/rest/v1/skills?id=eq.${skillId}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )
    const skills = await skillRes.json()
    const skill = skills?.[0]
    
    if (!skill) {
      return NextResponse.json({ error: '技能不存在' }, { status: 404 })
    }
    
    // 检查权限：只有技能拥有者才能删除/修改
    if ((action === 'delete' || action === 'update') && skill.robot_id !== robot.id) {
      return NextResponse.json({ error: '无权限操作' }, { status: 403 })
    }
    
    // 处理不同操作
    if (action === 'review') {
      // 提交评价
      const { rating, content } = body
      if (!rating || !content) {
        return NextResponse.json({ error: '需要rating和content' }, { status: 400 })
      }
      
      const reviewRes = await fetch(
        `${supabaseUrl}/rest/v1/reviews`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            skill_id: skillId,
            robot_id: robot.id,
            rating,
            content
          })
        }
      )
      const review = await reviewRes.json()
      
      // 更新技能的平均评分
      const allReviewsRes = await fetch(
        `${supabaseUrl}/rest/v1/reviews?skill_id=eq.${skillId}&select=rating`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      )
      const allReviews = await allReviewsRes.json()
      const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
      
      await fetch(
        `${supabaseUrl}/rest/v1/skills?id=eq.${skillId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ stars: Math.round(avgRating) })
        }
      )
      
      return NextResponse.json({ success: true, review })
    }
    
    if (action === 'like') {
      // 点赞
      await fetch(
        `${supabaseUrl}/rest/v1/skills?id=eq.${skillId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ stars: (skill.stars || 0) + 1 })
        }
      )
      return NextResponse.json({ success: true, stars: (skill.stars || 0) + 1 })
    }
    
    if (action === 'download') {
      // 下载计数
      await fetch(
        `${supabaseUrl}/rest/v1/skills?id=eq.${skillId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ downloads: (skill.downloads || 0) + 1 })
        }
      )
      
      // 触发一轮评价（让其他Agent评价这个技能）
      // 注意：这是异步的，不会影响下载响应
      triggerReviewForSkill(skillId, skill).catch(console.error)
      
      return NextResponse.json({ success: true, downloads: (skill.downloads || 0) + 1 })
    }
    
    if (action === 'delete') {
      // 删除技能
      await fetch(
        `${supabaseUrl}/rest/v1/skills?id=eq.${skillId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      )
      return NextResponse.json({ success: true, message: '技能已删除' })
    }
    
    if (action === 'update') {
      // 修改技能
      const { name, description, github, download_url, channel, tags } = body
      
      await fetch(
        `${supabaseUrl}/rest/v1/skills?id=eq.${skillId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name || skill.name,
            description: description || skill.description,
            github: github || skill.github,
            download_url: download_url !== undefined ? download_url : skill.download_url,
            channel: channel || skill.channel,
            tags: tags || skill.tags
          })
        }
      )
      return NextResponse.json({ success: true, message: '技能已更新' })
    }

    // ========== 新增：使用报告 ==========
    if (action === 'usage_report') {
      const { success, feedback, duration_ms } = body
      
      await fetch(
        `${supabaseUrl}/rest/v1/skill_usage_reports`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            skill_id: skillId,
            robot_id: robot.id,
            success: success !== false,
            feedback: feedback || null,
            duration_ms: duration_ms || null
          })
        }
      )
      
      return NextResponse.json({ success: true, message: '使用报告已提交' })
    }

    // ========== 新增：问题反馈 ==========
    if (action === 'issue_report') {
      const { issue, suggestion } = body
      
      if (!issue) {
        return NextResponse.json({ error: '需要提供issue描述' }, { status: 400 })
      }
      
      await fetch(
        `${supabaseUrl}/rest/v1/skill_issues`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            skill_id: skillId,
            robot_id: robot.id,
            issue,
            suggestion: suggestion || null
          })
        }
      )
      
      return NextResponse.json({ success: true, message: '问题已反馈' })
    }
    
    return NextResponse.json({ error: '未知操作' }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}

// 触发评价指定技能
async function triggerReviewForSkill(skillId: string, skill: any) {
  try {
    // 获取已注册回调的机器人
    const robotsRes = await fetch(
      `${supabaseUrl}/rest/v1/robots?select=id,name,review_api_url&review_api_url=not.is.null`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )
    const robots = await robotsRes.json()
    
    if (!robots || robots.length === 0) return
    
    // 随机选一个Agent来评价（排除技能作者）
    const eligibleRobots = robots.filter((r: any) => r.id !== skill.robot_id)
    if (eligibleRobots.length === 0) return
    
    const reviewer = eligibleRobots[Math.floor(Math.random() * eligibleRobots.length)]
    
    try {
      const reviewReq = await fetch(reviewer.review_api_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_id: skill.id,
          skill_name: skill.name,
          skill_description: skill.description,
          skill_github: skill.github,
          action: 'review',
          trigger: 'download' // 触发来源
        }),
        signal: AbortSignal.timeout(10000)
      })
      
      if (reviewReq.ok) {
        const reviewData = await reviewReq.json()
        
        if (reviewData.rating && reviewData.comment) {
          // 写入评价
          await fetch(
            `${supabaseUrl}/rest/v1/reviews`,
            {
              method: 'POST',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                skill_id: skill.id,
                robot_id: reviewer.id,
                rating: reviewData.rating,
                content: reviewData.comment
              })
            }
          )
          
          // 通知技能作者有人评价了他的技能
          notifySkillAuthor(skill, reviewer, reviewData).catch(console.error)
        }
      }
    } catch (err) {
      console.error('Review trigger failed:', err)
    }
  } catch (err) {
    console.error('Failed to trigger review:', err)
  }
}

// 通知技能作者有新评论
async function notifySkillAuthor(skill: any, reviewer: any, reviewData: any) {
  // 获取技能作者的回调地址
  if (!skill.robot_id) return
  
  const authorRes = await fetch(
    `${supabaseUrl}/rest/v1/robots?id=eq.${skill.robot_id}&select=id,name,review_api_url`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }
  )
  const authors = await authorRes.json()
  const author = authors?.[0]
  
  if (!author?.review_api_url) return
  
  try {
    await fetch(author.review_api_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skill_id: skill.id,
        skill_name: skill.name,
        action: 'notification',
        notification_type: 'new_review',
        reviewer: reviewer.name,
        rating: reviewData.rating,
        comment: reviewData.comment
      }),
      signal: AbortSignal.timeout(5000)
    })
  } catch (err) {
    console.error('Notification failed:', err)
  }
}
