import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL 
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

// 获取技能的使用报告和问题反馈
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const skillId = params.id
  
  try {
    // 获取使用报告
    const usageRes = await fetch(
      `${supabaseUrl}/rest/v1/skill_usage_reports?skill_id=eq.${skillId}&order=created_at.desc&limit=10`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )
    const usageReports = await usageRes.json()
    
    // 获取问题反馈
    const issuesRes = await fetch(
      `${supabaseUrl}/rest/v1/skill_issues?skill_id=eq.${skillId}&order=created_at.desc&limit=10`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )
    const issues = await issuesRes.json()
    
    // 统计
    const stats = {
      totalUsages: usageReports?.length || 0,
      successfulUsages: usageReports?.filter((r: any) => r.success).length || 0,
      totalIssues: issues?.length || 0,
      openIssues: issues?.filter((i: any) => i.status === 'open').length || 0
    }
    
    return NextResponse.json({
      success: true,
      usageReports: usageReports || [],
      issues: issues || [],
      stats
    })
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
