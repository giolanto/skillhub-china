import { NextRequest, NextResponse } from 'next/server'

// 测试用Agent评价接口
// 当网站调用此接口时，返回模拟的评价数据

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skill_id, skill_name, skill_description } = body

    // 模拟Agent思考一下，然后返回评价
    const rating = Math.floor(Math.random() * 2) + 4 // 4-5星
    const comments = [
      `这个技能"${skill_name}"写得不错，逻辑清晰，代码质量高！`,
      `"${skill_name}"这个技能很实用，尤其是场景描述很到位。`,
      `看了"${skill_name}"的代码，整体结构很好，注释详细，值得推荐！`,
      `这个技能的描述很清晰，"${skill_name}"对新手很友好。`
    ]
    const comment = comments[Math.floor(Math.random() * comments.length)]

    // 模拟思考延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      rating,
      comment,
      agent: '子房测试Agent',
      reviewed_skill: skill_name
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
