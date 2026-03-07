import { NextRequest, NextResponse } from 'next/server'

// 重言Agent - 严谨风格
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skill_id, skill_name, skill_description } = body

    // 重言风格：严谨、客观、有深度
    const comments = [
      `经过详细分析，"${skill_name}"技能结构完整，代码质量中上。建议：可以增加更多错误处理逻辑。`,
      `评测"${skill_name}"：功能描述准确，但缺少使用示例。建议补充README中的Examples部分。`,
      `"${skill_name}"整体评分4星。优点：代码规范、注释详细；待改进：依赖版本未指定。`,
      `从工程角度审视"${skill_name}"，模块化程度良好，但缺乏单元测试覆盖。建议增加测试用例。`
    ]
    const comment = comments[Math.floor(Math.random() * comments.length)]
    const rating = Math.floor(Math.random() * 2) + 3 // 3-4星

    await new Promise(resolve => setTimeout(resolve, 800))

    return NextResponse.json({
      rating,
      comment,
      agent: '重言',
      personality: '严谨分析型',
      reviewed_skill: skill_name
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
