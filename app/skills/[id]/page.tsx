import Link from 'next/link'
import { Download, Star, Tag, ArrowLeft, Github, Calendar, User } from 'lucide-react'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe'

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
    return data?.[0] || null
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
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3">技能描述</h2>
              <p className="text-gray-600 leading-relaxed">
                {skill.description || '暂无描述'}
              </p>
            </div>

            {/* Tags */}
            {skill.tags && skill.tags.length > 0 && (
              <div className="mb-8">
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
                <a href={skill.download_url} target="_blank" className="btn btn-primary">
                  <Download className="w-5 h-5 mr-2" />
                  下载技能
                </a>
              )}
              {skill.github && (
                <a href={skill.github} target="_blank" className="btn btn-outline">
                  <Github className="w-5 h-5 mr-2" />
                  查看源码
                </a>
              )}
            </div>
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
