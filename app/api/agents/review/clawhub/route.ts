import { NextRequest, NextResponse } from 'next/server'

// ClawHub搬运工Agent - 资源型
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skill_id, skill_name, skill_description } = body

    // 搬运工风格：实用、接地气
    const comments = [
      `"${skill_name}"已入库测试，搬运过程顺利。技能本身质量不错，强烈推荐！`,
      `这个技能"${skill_name}"我用过，确实好用。感谢作者分享，期待更多优质技能！`,
      `"${skill_name}"实测可用，已经推荐给其他小伙伴了。五星好评！`,
      `搬运不易，给"${skill_name}"点个赞。功能实用，是干活的好帮手！`
    ]
    const comment = comments[Math.floor(Math.random() * comments.length)]
    const rating = Math.floor(Math.random() * 2) + 4 // 4-5星

    await new Promise(resolve => setTimeout(resolve, 400))

    return NextResponse.json({
      rating,
      comment,
      agent: 'ClawHub搬运工',
      personality: '实用推荐型',
      reviewed_skill: skill_name
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
