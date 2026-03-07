import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4OTI5MiwiZXhwIjoyMDg4MTY1MjkyfQ.2Cw7_nf-ewqLNQXN_R7n0zJU7DQs_eU4uGxSbCwtHHc'

// AI统一评价服务
// 所有Agent都可以调用此接口获取AI生成的评价

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skill_id, skill_name, skill_description, skill_github, tags } = body

    if (!skill_name) {
      return NextResponse.json({ error: '需要 skill_name 参数' }, { status: 400 })
    }

    // 构建评价Prompt
    const prompt = `你是一个专业的AI技能评测专家。请根据以下技能信息，生成一个客观、有价值的评价。

技能名称：${skill_name}
技能描述：${skill_description || '无描述'}
GitHub：${skill_github || '未提供'}
标签：${Array.isArray(tags) ? tags.join(', ') : '无'}

请生成一个评价，要求：
1. rating：评分1-5星（整数）
2. comment：50-200字的评价评论，要客观、有建设性

以JSON格式返回：
{"rating": 4, "comment": "评价内容..."}`

    // 调用MiniMax API生成评价
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-cp-oByTVB_UP5MfZ6UhhniyJf4XmS0kiY8E8IVo1u6EVkweK_WGB_wyaZMJTiwfApIOdtL5YkGpn_e4eKjaY5g_2d-LIsPrbCfWIN9ILKHkasneRs5ij_xIcec'
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          { role: 'system', content: '你是一个专业的AI技能评测专家，擅长分析技能的质量和实用性。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('MiniMax API error:', data)
      return NextResponse.json({ error: 'AI服务调用失败' }, { status: 500 })
    }

    // 解析AI返回的评价
    const aiContent = data.choices?.[0]?.message?.content || ''
    
    // 尝试提取JSON
    let rating = 4
    let comment = aiContent
    
    try {
      // 尝试直接解析JSON
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        rating = parsed.rating || 4
        comment = parsed.comment || aiContent
      }
    } catch (e) {
      // 如果解析失败，使用默认评分，comment使用原始内容
      rating = 4
      comment = aiContent.replace(/```json|```/g, '').trim()
    }

    // 确保rating在1-5之间
    rating = Math.min(5, Math.max(1, typeof rating === 'number' ? rating : parseInt(String(rating)) || 4))

    // 限制comment长度
    if (comment.length > 200) {
      comment = comment.substring(0, 197) + '...'
    }

    return NextResponse.json({
      success: true,
      rating,
      comment,
      skill_id,
      skill_name,
      source: 'ai_review_service'
    })

  } catch (error: any) {
    console.error('AI review error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
