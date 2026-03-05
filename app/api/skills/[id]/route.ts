import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || ''
  
  // 处理 /download 路径
  const pathParts = request.nextUrl.pathname.split('/')
  const isDownload = pathParts[pathParts.length - 1] === 'download'
  
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
    
    // 如果是下载请求或有download_url，直接重定向
    if (skill.download_url && (isDownload || action === 'download')) {
      return NextResponse.redirect(skill.download_url)
    }
    
    // 否则返回技能信息
    return NextResponse.json({
      name: skill.name,
      description: skill.description,
      github: skill.github,
      channel: skill.channel,
      tags: skill.tags,
      version: '1.0.0',
      download_url: skill.download_url,
      install_command: skill.download_url 
        ? `openclaw install ${request.nextUrl.origin}/api/skills/${id}/download`
        : null
    })
    
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
