import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODkyOTIsImV4cCI6MjA4ODE2NTI5Mn0.xgQZ6v_EIvipDjufzcW-yo0JpS6yosplAPWNQIXzi14'

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

// 获取技能评价 / 下载技能
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const skillId = params.id
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const robotId = searchParams.get('robot_id')
  
  // 处理下载请求
  if (action === 'download') {
    try {
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
      
      // 增加下载计数
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
      
      // 如果提供了robot_id，记录安装互动
      if (robotId) {
        await fetch(
          `${supabaseUrl}/rest/v1/agent_interactions`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              robot_id: robotId,
              skill_id: parseInt(skillId),
              interaction_type: 'install',
              content: '从网站下载安装'
            })
          }
        )
      }
      
      // 触发AI评价
      triggerReviewForSkill(skillId, skill).catch(console.error)
      
      // 返回下载信息
      if (skill.download_url) {
        // 如果是相对路径，构建完整URL
        let downloadUrl = skill.download_url
        if (!downloadUrl.startsWith('http')) {
          downloadUrl = `https://www.agent-skills.net.cn${downloadUrl}`
        }
        
        // 尝试从URL获取文件内容
        try {
          const fileRes = await fetch(downloadUrl)
          if (fileRes.ok) {
            const fileBuffer = await fileRes.arrayBuffer()
            // 根据文件类型设置content-type
            const contentType = downloadUrl.endsWith('.zip') ? 'application/zip' : 'text/plain'
            const filename = downloadUrl.split('/').pop() || 'skill'
            
            return new NextResponse(fileBuffer, {
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`
              }
            })
          }
        } catch (e) {
          console.error('Download error:', e)
        }
        
        // 如果获取失败，直接重定向
        return NextResponse.redirect(downloadUrl)
      } else if (skill.github) {
        return NextResponse.redirect(skill.github)
      } else {
        return NextResponse.json({ error: '无可用下载链接' }, { status: 404 })
      }
    } catch (error) {
      return NextResponse.json({ error: '下载失败' }, { status: 500 })
    }
  }
  
  // 获取评价列表
  try {
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

// 触发评价指定技能（使用AI统一评价服务）
async function triggerReviewForSkill(skillId: string, skill: any) {
  try {
    // 调用AI统一评价服务
    const aiReviewRes = await fetch(
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
    
    if (aiReviewRes.ok) {
      const reviewData = await aiReviewRes.json()
      
      if (reviewData.success && reviewData.rating && reviewData.comment) {
        // 写入评价（使用robot_id=0表示AI评价）
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
              robot_id: 0, // 0表示AI评价
              rating: reviewData.rating,
              content: reviewData.comment
            })
          }
        )
        
        console.log(`AI review generated for skill ${skill.name}: ${reviewData.rating}星`)
      }
    } else {
      console.error('AI review failed:', await aiReviewRes.text())
    }
  } catch (err) {
    console.error('Failed to trigger AI review:', err)
  }
}

// 通知技能作者有新评论
async function notifySkillAuthor(skill: any, reviewerName: string, reviewData: any) {
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
        reviewer: reviewerName,
        rating: reviewData.rating,
        comment: reviewData.comment
      }),
      signal: AbortSignal.timeout(5000)
    })
  } catch (err) {
    console.error('Notification failed:', err)
  }
}
