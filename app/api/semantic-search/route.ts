import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4OTI5MiwiZXhwIjoyMDg4MTY1MjkyfQ.2Cw7_nf-ewqLNQXN_R7n0zJU7DQs_eU4uGxSbCwtHHc'

// 同义词库
const synonyms: Record<string, string[]> = {
  '微信': ['公众号', '微信文章', '微信搜索', '微信监控'],
  '公众号': ['微信', '微信文章', '微信公众号'],
  '视频': ['B站', 'YouTube', 'youtube', 'b站', '字幕', '下载'],
  'B站': ['视频', 'bilibili', 'B站', '字幕'],
  '写作': ['文章', '创作', '文案', '润色'],
  'AI': ['人工智能', '大模型', 'GPT', '模型'],
  '健康': ['医疗', '医生', '体检', '疾病'],
  '天气': ['气象', '温度', '预报'],
  '搜索': ['查询', '查找', '检索'],
  '邮件': ['Email', 'email', ' Gmail'],
  '笔记': ['flomo', 'notion', '记录'],
  '翻译': ['语言', '中英', '多扩展搜索词语言'],
}

// 
function expandSearchTerms(query: string): string[] {
  const terms = [query]
  const lowerQuery = query.toLowerCase()
  
  // 添加同义词
  for (const [key, values] of Object.entries(synonyms)) {
    if (lowerQuery.includes(key.toLowerCase())) {
      terms.push(...values)
    }
  }
  
  // 添加常见变体
  if (query.length > 2) {
    // 添加拼音首字母（简单版本）
    // 添加常见后缀
    terms.push(query + '工具')
    terms.push(query + '助手')
    if (!query.endsWith('技能')) {
      terms.push(query + '技能')
    }
  }
  
  return Array.from(new Set(terms))
}

// AI意图理解（轻量版 - 使用规则）
function understandIntent(query: string): string[] {
  const intents: string[] = []
  const lowerQuery = query.toLowerCase()
  
  // 意图识别
  if (lowerQuery.includes('下载') || lowerQuery.includes('获取')) {
    intents.push('download', '获取', '下载')
  }
  if (lowerQuery.includes('搜索') || lowerQuery.includes('找')) {
    intents.push('search', '查询', '搜索')
  }
  if (lowerQuery.includes('监控') || lowerQuery.includes('追踪')) {
    intents.push('monitor', '监控', '追踪')
  }
  if (lowerQuery.includes('生成') || lowerQuery.includes('创建')) {
    intents.push('generate', '生成', '创建')
  }
  if (lowerQuery.includes('翻译')) {
    intents.push('translate', '翻译')
  }
  if (lowerQuery.includes('总结') || lowerQuery.includes('摘要')) {
    intents.push('summary', '总结', '摘要')
  }
  
  return intents
}

// GET: 语义搜索
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const channel = searchParams.get('channel')
  const limit = searchParams.get('limit') || '20'

  if (!query || query.length < 1) {
    return NextResponse.json({ error: '需要搜索关键词' }, { status: 400 })
  }

  try {
    // 1. 扩展搜索词
    const expandedTerms = expandSearchTerms(query)
    const intents = understandIntent(query)
    
    // 2. 先获取所有技能，然后在代码中过滤（避免PostgREST复杂嵌套问题）
    let queryUrl = `${supabaseUrl}/rest/v1/skills?select=*&order=downloads.desc&limit=100`
    
    if (channel) {
      queryUrl += `&channel=cs.{${channel}}`
    }

    const res = await fetch(queryUrl, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    let allSkills = await res.json()

    // 3. 在代码中进行语义过滤
    const lowerQuery = query.toLowerCase()
    const searchTokens = [...expandedTerms, ...intents]
    
    let skills = (allSkills || []).filter((skill: any) => {
      const searchText = [
        skill.name || '',
        skill.description || '',
        ...(skill.tags || [])
      ].join(' ').toLowerCase()
      
      // 检查是否匹配任何搜索词
      return searchTokens.some(token => 
        searchText.includes(token.toLowerCase())
      )
    }).map((skill: any) => {
      let score = skill.downloads || 0
      
      // 精确匹配加分
      if (skill.name?.toLowerCase().includes(lowerQuery)) score += 100
      if (skill.description?.toLowerCase().includes(lowerQuery)) score += 50
      
      // 同义词匹配加分
      for (const term of expandedTerms) {
        if (skill.name?.toLowerCase().includes(term.toLowerCase())) score += 30
        if (skill.tags?.some((t: string) => t.toLowerCase().includes(term.toLowerCase()))) score += 20
      }
      
      // 意图匹配加分
      for (const intent of intents) {
        if (skill.name?.toLowerCase().includes(intent)) score += 15
        if (skill.description?.toLowerCase().includes(intent)) score += 10
      }
      
      return { ...skill, _relevanceScore: score }
    })
    
    // 按相关度排序并限制数量
    skills = skills
      .sort((a: any, b: any) => b._relevanceScore - a._relevanceScore)
      .slice(0, Number(limit))

    return NextResponse.json({
      skills: skills || [],
      total: skills?.length || 0,
      query,
      expandedTerms,
      intents,
      type: 'semantic'
    })

  } catch (error) {
    console.error('语义搜索错误:', error)
    return NextResponse.json({ error: '搜索失败' }, { status: 500 })
  }
}
