'use client'

import Link from 'next/link'
import { Download, Star, Tag, ArrowLeft, Github, Calendar, Terminal, BookOpen, ExternalLink, Copy, Check } from 'lucide-react'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

// 技能详细信息（用于补充数据库中缺失的字段）
const skillDetails: Record<string, any> = {
  '飞书文件发送': {
    tools_required: ['飞书OpenAPI'],
    config_required: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'],
    content: `# 飞书文件发送
通过飞书发送文件、图片、消息给指定用户

## 功能
- 发送文件附件
- 发送图片
- 发送文本消息

## Setup
1. 创建飞书应用
2. 配置App ID和Secret

## Usage
feishu-send --file /path/to/file.pdf --user "用户名"`
  },
  '微信日报': {
    tools_required: ['微信聊天记录导出'],
    config_required: [],
    content: `# 微信日报
微信群聊天记录日报生成工具

## 功能
- 自动分析群聊记录
- AI生成内容摘要
- 生成手机端日报图片`
  },
  '钉钉推送': {
    tools_required: ['钉钉机器人Webhook'],
    config_required: ['DINGTALK_WEBHOOK', 'DINGTALK_SECRET'],
    content: `# 钉钉推送
钉钉群消息推送机器人

## 功能
- Markdown格式消息
- @提及成员
- 签名验证`
  }
}

async function getSkill(slug: string) {
  try {
    let queryParam = ''
    if (!isNaN(Number(slug))) {
      queryParam = `id=eq.${slug}`
    } else {
      queryParam = `name=ilike.*${slug}*`
    }
    
    const res = await fetch(`${supabaseUrl}/rest/v1/skills?${queryParam}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      next: { revalidate: 10 }
    })
    const data = await res.json()
    const skill = data?.[0] || null
    
    if (skill) {
      // 尝试用 name 精确匹配 details
      const details = skillDetails[skill.name] || {}
      return {
        ...skill,
        version: details.version || '1.0.0',
        tools_required: details.tools_required || [],
        config_required: details.config_required || [],
        content: details.content || skill.description || '暂无详细说明'
      }
    }
    return skill
  } catch (e) {
    // 模糊匹配
    try {
      const res2 = await fetch(`${supabaseUrl}/rest/v1/skills?name=ilike.*${slug}*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        next: { revalidate: 10 }
      })
      const data2 = await res2.json()
      if (data2?.length > 0) {
        const skill = data2[0]
        const details = skillDetails[skill.name] || {}
        return {
          ...skill,
          version: details.version || '1.0.0',
          tools_required: details.tools_required || [],
          config_required: details.config_required || [],
          content: details.content || skill.description || '暂无详细说明'
        }
      }
    } catch (e2) {}
    return null
  }
}

export default async function SkillDetail({ params }: { params: { slug: string } }) {
  const skill = await getSkill(params.slug)
  
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft className="w-5 h-5" />
            返回技能列表
          </Link>
          <a 
            href={skill.github || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <Github className="w-5 h-5" />
            GitHub
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 技能头部 - 模仿 ClawHub 风格 */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{skill.name}</h1>
              <p className="text-lg text-gray-600">{skill.description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{skill.stars || 0}</span>
            </div>
          </div>
          
          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(skill.channel || []).map((c: string) => (
              <span key={c} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                {c}
              </span>
            ))}
            {(skill.tags || []).map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {tag}
              </span>
            ))}
          </div>
          
          {/* 下载按钮 - 优先Supabase，其次GitHub */}
          <div className="flex flex-wrap gap-3">
            {skill.download_url ? (
              <a 
                href={skill.download_url} 
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition"
              >
                <Download className="w-5 h-5" />
                下载技能
              </a>
            ) : skill.github ? (
              <a 
                href={skill.github} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition"
              >
                <Download className="w-5 h-5" />
                从GitHub下载
              </a>
            ) : (
              <span className="text-gray-400">暂无可下载文件</span>
            )}
            {skill.github && (
              <a 
                href={skill.github} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
            )}
          </div>
        </div>

        {/* 安装命令 */}
        {skill.download_url && (
          <div className="bg-gray-900 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                OpenClaw 安装命令
              </h3>
              <button 
                onClick={() => {
      const cmd = `openclaw install https://agent-skills.net.cn/api/skills/${skill.id}?action=download`;
      navigator.clipboard.writeText(cmd);
      alert("命令已复制到剪贴板！");
    }}
                className="text-gray-400 hover:text-white transition"
                title="复制命令"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <code className="block bg-black/50 p-4 rounded-lg text-green-400 text-sm overflow-x-auto">
              openclaw install https://agent-skills.net.cn/api/skills/{skill.id}?action=download
            </code>
          </div>
        )}

        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">{skill.downloads || 0}</div>
            <div className="text-sm text-gray-500">下载次数</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">v{skill.version || '1.0.0'}</div>
            <div className="text-sm text-gray-500">版本</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {skill.created_at ? new Date(skill.created_at).toLocaleDateString('zh-CN') : '-'}
            </div>
            <div className="text-sm text-gray-500">更新时间</div>
          </div>
        </div>

        {/* SKILL.md 内容 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              README
            </h2>
          </div>
          <div className="p-6">
            <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto">
{skill.content || '暂无详细说明'}
            </pre>
          </div>
        </div>

        {/* 底部 */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-primary hover:underline">
            ← 返回技能列表
          </Link>
        </div>
      </main>
    </div>
  )
}
