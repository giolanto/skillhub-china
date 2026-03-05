import Link from 'next/link'
import { Download, Star, Tag, ArrowLeft, Github, Calendar, User, Terminal, Wrench, Settings, BookOpen, Code } from 'lucide-react'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

// 技能详细信息
const skillDetails: Record<string, any> = {
  'Feishu Bridge': {
    tools_required: ['WebSocket', '飞书OpenAPI'],
    config_required: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'],
    setup_guide: '在飞书开放平台创建应用，获取App ID和App Secret',
    example_usage: '配置飞书机器人：\n1. 创建飞书应用\n2. 添加权限：im:message:send, im:chat:create\n3. 获取App ID和Secret\n4. 配置到OpenClaw',
    version: '1.0.0',
    openclow_version: '>=0.9.0',
    dependencies: []
  },
  'Feishu Messaging': {
    tools_required: ['飞书OpenAPI'],
    config_required: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'],
    setup_guide: '创建飞书应用并获取App ID和Secret',
    example_usage: '发送消息：\nfeishu-send --user "张三" --message "Hello"',
    version: '1.0.0',
    openclow_version: '>=0.9.0',
    dependencies: []
  },
  'feishu-send': {
    tools_required: ['飞书OpenAPI'],
    config_required: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'],
    setup_guide: '配置飞书应用权限：im:message:send, im:file:upload',
    example_usage: '发送文件：\nfeishu-send --file /path/to/file.pdf',
    version: '1.0.0',
    openclow_version: '>=0.9.0',
    dependencies: []
  }
}

async function getSkill(id: string) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/skills?id=eq.${id}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      next: { revalidate: 10 }
    })
    const data = await res.json()
    const skill = data?.[0] || null
    
    if (skill) {
      // 合并详细信息
      const details = skillDetails[skill.name] || {}
      return {
        ...skill,
        version: details.version || '1.0.0',
        openclow_version: details.openclow_version || '>=0.9.0',
        tools_required: details.tools_required || [],
        config_required: details.config_required || [],
        setup_guide: details.setup_guide || '请下载技能包查看详细设置指南',
        example_usage: details.example_usage || '请下载技能包查看使用示例',
        dependencies: details.dependencies || []
      }
    }
    return skill
  } catch (e) {
    console.error('Error:', e)
    return null
  }
}

export default async function SkillDetail({ params }: { params: { id: string } }) {
  const skill = await getSkill(params.id)
  
  if (!skill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">技能不存在</h1>
          <Link href="/" className="text-primary hover:underline">← 返回首页</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft className="w-5 h-5" />
            返回首页
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Banner */}
          <div className="bg-gradient-to-r from-primary to-secondary h-32 flex items-end px-8 pb-4">
            <div className="text-white">
              <h1 className="text-3xl font-bold">{skill.name}</h1>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  v{skill.version || '1.0.0'}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  OpenClaw {skill.openclow_version || '>=0.9.0'}
                </span>
                {(skill.channel || ['通用']).map((c: string) => (
                  <span key={c} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Stats */}
            <div className="flex gap-8 mb-6 text-gray-600">
              <span className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                {skill.downloads || 0} 次下载
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                {skill.stars || 0} 评分
              </span>
              {skill.created_at && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {new Date(skill.created_at).toLocaleDateString('zh-CN')}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">技能描述</h2>
              <p className="text-gray-600 leading-relaxed">
                {skill.description || '暂无描述'}
              </p>
            </div>

            {/* Required Tools */}
            {skill.tools_required && skill.tools_required.length > 0 && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h3 className="text-purple-800 font-bold mb-3 flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  所需工具
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(skill.tools_required || []).map((tool: string) => (
                    <span key={tool} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Required Config */}
            {skill.config_required && skill.config_required.length > 0 && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <h3 className="text-orange-800 font-bold mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  所需配置
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(skill.config_required || []).map((config: string) => (
                    <code key={config} className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded font-mono">
                      {config}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {/* Setup Guide */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-blue-800 font-bold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                设置指南
              </h3>
              <p className="text-blue-700 text-sm leading-relaxed whitespace-pre-line">
                {skill.setup_guide || '暂无设置指南'}
              </p>
            </div>

            {/* Example Usage */}
            <div className="mb-6 p-4 bg-gray-900 rounded-lg">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Code className="w-5 h-5" />
                使用示例
              </h3>
              <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-line">
                {skill.example_usage || '暂无使用示例'}
              </pre>
            </div>

            {/* Dependencies */}
            {skill.dependencies && skill.dependencies.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
                <h3 className="text-red-800 font-bold mb-3">依赖技能</h3>
                <div className="flex flex-wrap gap-2">
                  {(skill.dependencies || []).map((dep: string) => (
                    <Link key={dep} href={`/skills/${dep}`} className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:underline">
                      {dep}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {skill.tags && skill.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3">标签</h2>
                <div className="flex flex-wrap gap-2">
                  {(skill.tags || []).map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              {skill.download_url && (
                <>
                  <a href={skill.download_url} target="_blank" className="btn btn-primary">
                    <Download className="w-5 h-5 mr-2" />
                    下载技能
                  </a>
                  <div className="btn btn-success text-white">
                    <Terminal className="w-5 h-5 mr-2" />
                    一键安装
                  </div>
                </>
              )}
            </div>

            {/* Install Command */}
            {skill.download_url && (
              <div className="mt-6 p-4 bg-gray-900 rounded-lg">
                <h3 className="text-white font-bold mb-2">🤖 Agent机器人安装命令</h3>
                <p className="text-gray-400 text-sm mb-2">复制以下命令到OpenClaw执行：</p>
                <code className="block bg-black p-3 rounded text-green-400 text-sm break-all">
                  openclaw install https://agent-skills.net.cn/api/skills/{skill.id}?action=download
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Related Skills */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">其他技能</h2>
          <Link href="/" className="text-primary hover:underline">
            ← 返回技能列表
          </Link>
        </div>
      </main>
    </div>
  )
}
