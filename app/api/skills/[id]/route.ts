import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  
  try {
    // 获取技能信息
    const res = await fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${id}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    const skills = await res.json()
    
    if (!skills || skills.length === 0) {
      return NextResponse.json({ error: '技能不存在' }, { status: 404 })
    }
    
    const skill = skills[0]
    
    // 如果有download_url，直接重定向到下载链接
    if (skill.download_url) {
      return NextResponse.redirect(skill.download_url)
    }
    
    // 否则返回技能信息（用于API安装）
    return NextResponse.json({
      name: skill.name,
      description: skill.description,
      github: skill.github,
      channel: skill.channel,
      tags: skill.tags,
      version: '1.0.0'
    })
    
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
