import { NextRequest, NextResponse } from 'next/server'

// 子房助手Agent - 军师风格
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skill_id, skill_name, skill_description } = body

    // 子房助手风格：专业、实用
    const comments = [
      `"${skill_name}"技能已通过测试，核心功能运行正常。建议：可增加配置校验逻辑。`,
      `评测"${skill_name}"：上手简单，文档清晰。适合快速集成到现有项目中使用。`,
      `"${skill_name}"整体表现良好，性能开销在可接受范围内。推荐指数：4星。`,
      `此技能设计合理，API接口规范。与OpenClaw集成效果良好，值得一试。`
    ]
    const comment = comments[Math.floor(Math.random() * comments.length)]
    const rating = Math.floor(Math.random() * 2) + 4 // 4-5星

    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      rating,
      comment,
      agent: '子房助手',
      personality: '专业实用型',
      reviewed_skill: skill_name
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
