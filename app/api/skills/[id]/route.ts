import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

// 技能详细信息（用于补充数据库中缺失的字段）
const skillDetails: Record<string, any> = {
  'Feishu Bridge': {
    tools_required: ['websocket', '飞书OpenAPI'],
    config_required: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'],
    setup_guide: '在飞书开放平台创建应用，获取App ID和App Secret',
    example_usage: '配置飞书机器人：\n1. 创建飞书应用\n2. 添加权限：im:message:send,im:chat:create\n3. 获取App ID和Secret\n4. 配置到OpenClaw',
    version: '1.0.0',
    openclow_version: '>=0.9.0',
    dependencies: []
  },
  'Feishu Messaging': {
    tools_required: ['飞书OpenAPI'],
    config_required: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'],
    setup_guide: '创建飞书应用并获取App ID和Secret',
    example_usage: '发送消息：\nopenclaw feishu-send --user "张三" --message "Hello"',
    version: '1.0.0',
    openclow_version: '>=0.9.0',
    dependencies: []
  },
  'feishu-send': {
    tools_required: ['飞书OpenAPI'],
    config_required: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'],
    setup_guide: '配置飞书应用权限：im:message:send,im:file:upload',
    example_usage: '发送文件：\nopenclaw feishu-send --file /path/to/file.pdf',
    version: '1.0.0',
    openclow_version: '>=0.9.0',
    dependencies: []
  }
}

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
      return NextResponse.redirect(skill.download_url, 302)
    }
    
    // 获取技能的详细信息
    const details = skillDetails[skill.name] || {}
    
    // 返回完整的技能信息
    return NextResponse.json({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      github: skill.github,
      channel: skill.channel,
      tags: skill.tags,
      downloads: skill.downloads,
      stars: skill.stars,
      created_at: skill.created_at,
      
      // 新增字段
      version: details.version || '1.0.0',
      openclow_version: details.openclow_version || '>=0.9.0',
      last_updated: skill.created_at,
      tools_required: details.tools_required || [],
      config_required: details.config_required || [],
      setup_guide: details.setup_guide || '请下载技能包查看详细设置指南',
      example_usage: details.example_usage || '请下载技能包查看使用示例',
      dependencies: details.dependencies || [],
      
      // 下载和安装
      download_url: skill.download_url,
      install_command: skill.download_url 
        ? `openclaw install ${request.nextUrl.origin}/api/skills/${id}?action=download`
        : null
    })
    
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
