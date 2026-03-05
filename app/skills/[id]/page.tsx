import Link from 'next/link'
import { Download, Star, Tag, ArrowLeft, Github, Calendar, Terminal, Wrench, Settings, BookOpen, Code, Shield, User, Eye, GitBranch } from 'lucide-react'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

// 技能详细信息
const skillDetails: Record<string, any> = {
  'Feishu Bridge': {
    tools_required: ['WebSocket', '飞书OpenAPI'],
    config_required: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'],
    setup_guide: `## 配置步骤

### 1. 创建飞书应用
访问 [飞书开放平台](https://open.feishu.cn/) 创建应用

### 2. 添加权限
- im:message:send (发送消息)
- im:chat:create (创建群聊)
- im:chat:manage_robots (管理机器人)

### 3. 获取凭证
获取 App ID 和 App Secret

### 4. 配置环境变量
\`\`\`bash
export FEISHU_APP_ID="your-app-id"
export FEISHU_APP_SECRET="your-secret"
\`\`\``,
    example_usage: `# 发送消息
feishu-send --user "张三" --message "Hello"

# 创建群聊
feishu-create-chat --name "项目组"

# 发送文件
feishu-send-file --file /path/to/file.pdf`,
    version: '1.0.0',
    openclow_version: '>=0.9.0',
    dependencies: [],
    content: `# Feishu Bridge
连接飞书机器人到Clawdbot via WebSocket长连接。

## 功能
- WebSocket长连接
- 无需公网服务器
- 支持飞书消息收发

## Setup
1. 创建飞书应用
2. 添加权限：im:message:send
3. 配置环境变量

## Usage
配置完成后，机器人自动连接飞书渠道。`
  },
  'Feishu Messaging': {
    tools_required: ['飞书OpenAPI', 'curl'],
    config_required: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'],
    setup_guide: `## 配置步骤

### 1. 创建飞书应用
访问飞书开放平台创建应用

### 2. 获取凭证
获取 App ID 和 App Secret

### 3. 配置环境变量
\`\`\`bash
export FEISHU_APP_ID="your-app-id"
export FEISHU_APP_SECRET="your-secret"
\`\`\``,
    example_usage: `# 发送文本消息
feishu-message send --user "用户名" --text "消息内容"

# 发送图片
feishu-message send-image --user "用户名" --image /path/to/image.jpg

# 创建群聊
feishu-message create-chat --name "群聊名称"`,
    version: '1.0.0',
    openclow_version: '>=0.9.0',
    dependencies: [],
    content: `# Feishu Messaging
飞书消息发送与文档创建工作流。

## 功能
- 发送文本、图片、文件消息
- 创建和管理群聊
- 查找群成员、群ID

## Setup
1. 创建飞书应用
2. 配置App ID和Secret

## Usage
详见上方使用示例`
  },
  'feishu-send': {
    tools_required: ['飞书OpenAPI'],
    config_required: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'],
    setup_guide: `## 配置步骤

### 1. 创建飞书应用
访问飞书开放平台创建应用

### 2. 添加权限
- im:message:send (发送消息)
- im:file:upload (上传文件)
- im:file:download (下载文件)

### 3. 配置环境变量
\`\`\`bash
export FEISHU_APP_ID="your-app-id"
export FEISHU_APP_SECRET="your-secret"
\`\`\``,
    example_usage: `# 发送文件
feishu-send --file /path/to/document.pdf --user "张三"

# 发送图片
feishu-send --image /path/to/photo.jpg --chat-id "群ID"

# 发送文本
feishu-send --text "Hello" --user "李四"`,
    version: '1.0.0',
    openclow_version: '>=0.9.0',
    dependencies: [],
    content: `# feishu-send
飞书文件发送技能 - 通过飞书发送文件、图片、消息给指定用户

## 功能
- 发送文件附件
- 发送图片
- 发送文本消息

## Setup
1. 创建飞书应用
2. 配置App ID和Secret

## Usage
feishu-send --file /path/to/file.pdf --user "用户名"`
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
      const details = skillDetails[skill.name] || {}
      return {
        ...skill,
        version: details.version || '1.0.0',
        openclow_version: details.openclow_version || '>=0.9.0',
        tools_required: details.tools_required || [],
        config_required: details.config_required || [],
        setup_guide: details.setup_guide || '请下载技能包查看详细设置指南',
        example_usage: details.example_usage || '请下载技能包查看使用示例',
        dependencies: details.dependencies || [],
        content: details.content || skill.description || '暂无详细说明'
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
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft className="w-5 h-5" />
            返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 技能头部信息 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-8">
            {/* 标题和描述 */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{skill.name}</h1>
              <p className="text-lg text-gray-600">{skill.description}</p>
            </div>
            
            {/* 统计信息 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4" />
                <strong className="text-gray-900">{skill.stars || 0}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <strong className="text-gray-900">{skill.downloads || 0}</strong> 次下载
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <strong className="text-gray-900">{skill.downloads || 0}</strong> 总安装
              </span>
              <span className="text-gray-400">|</span>
              <span className="flex items-center gap-1">
                <GitBranch className="w-4 h-4" />
                v{skill.version || '1.0.0'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {skill.created_at ? new Date(skill.created_at).toLocaleDateString('zh-CN') : '最近更新'}
              </span>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              {(skill.channel || []).map((c: string) => (
                <span key={c} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {c}
                </span>
              ))}
              {(skill.tags || []).map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 运行时要求 */}
          <div className="border-t border-gray-100 bg-gray-50 px-8 py-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              运行时要求
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* 所需工具 */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-sm font-medium text-gray-500 mb-2">工具</h4>
                <div className="flex flex-wrap gap-2">
                  {(skill.tools_required || []).length > 0 ? (
                    (skill.tools_required || []).map((tool: string) => (
                      <span key={tool} className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded">
                        {tool}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">无特殊要求</span>
                  )}
                </div>
              </div>
              
              {/* 环境变量 */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-sm font-medium text-gray-500 mb-2">环境变量</h4>
                <div className="flex flex-wrap gap-2">
                  {(skill.config_required || []).length > 0 ? (
                    (skill.config_required || []).map((config: string) => (
                      <code key={config} className="px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded font-mono">
                        {config}
                      </code>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">无需配置</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="border-t border-gray-100 px-8 py-6 flex flex-wrap gap-3">
            {skill.download_url && (
              <>
                <a href={skill.download_url} target="_blank" className="btn btn-primary btn-lg">
                  <Download className="w-5 h-5 mr-2" />
                  下载ZIP
                </a>
                <button className="btn btn-success btn-lg text-white">
                  <Terminal className="w-5 h-5 mr-2" />
                  一键安装
                </button>
              </>
            )}
          </div>
        </div>

        {/* 安装命令 */}
        {skill.download_url && (
          <div className="bg-gray-900 rounded-xl p-6 mb-6">
            <h3 className="text-white font-bold mb-3">🤖 Agent安装命令</h3>
            <code className="block bg-black p-4 rounded-lg text-green-400 text-sm overflow-x-auto">
              openclaw install https://agent-skills.net.cn/api/skills/{skill.id}?action=download
            </code>
          </div>
        )}

        {/* SKILL.md 内容 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              SKILL.md
            </h2>
          </div>
          <div className="p-6">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 text-sm font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto">
{skill.content || skill.setup_guide || '暂无内容'}
              </pre>
            </div>
          </div>
        </div>

        {/* 相关技能 */}
        <div className="mt-8">
          <Link href="/" className="text-primary hover:underline font-medium">
            ← 返回技能列表
          </Link>
        </div>
      </main>
    </div>
  )
}
