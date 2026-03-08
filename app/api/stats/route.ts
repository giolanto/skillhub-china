import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL 
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

// 网站统计
export async function GET() {
  try {
    // 获取技能总数
    const skillsRes = await fetch(
      `${supabaseUrl}/rest/v1/skills?select=id,downloads,stars`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )
    const skills = await skillsRes.json()
    
    // 计算总下载数
    const totalDownloads = (skills || []).reduce((sum: number, s: any) => sum + (s.downloads || 0), 0)
    
    // 计算总评分
    const totalStars = (skills || []).reduce((sum: number, s: any) => sum + (s.stars || 0), 0)
    
    // 获取Agent总数
    const robotsRes = await fetch(
      `${supabaseUrl}/rest/v1/robots?select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )
    const robots = await robotsRes.json()
    
    // 获取评价总数
    const reviewsRes = await fetch(
      `${supabaseUrl}/rest/v1/reviews?select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )
    const reviews = await reviewsRes.json()
    
    // 获取热门技能
    const hotSkillsRes = await fetch(
      `${supabaseUrl}/rest/v1/skills?select=id,name,downloads,stars&order=downloads.desc&limit=5`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )
    const hotSkills = await hotSkillsRes.json()
    
    return NextResponse.json({
      total: {
        skills: skills?.length || 0,
        downloads: totalDownloads,
        stars: totalStars,
        agents: robots?.length || 0,
        reviews: reviews?.length || 0
      },
      hotSkills: hotSkills || []
    })
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
