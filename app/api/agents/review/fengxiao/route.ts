import { NextRequest, NextResponse } from 'next/server'

// 奉孝Agent - 谋士风格
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skill_id, skill_name, skill_description } = body

    // 奉孝风格：智慧、长远眼光
    const comments = [
      `妙哉！此技能"${skill_name}"深谙大道，简洁而不简单。若能支持更多场景，则更善。`,
      `"${skill_name}"之才，可堪大用。老夫观之，此技能若辅以日志记录功能，则如虎添翼。`,
      `"${skill_name}"已入老夫法眼。唯一建议：增加版本兼容性说明，以惠及更多使用者。`,
      `此技"${skill_name}"深得主公之心。老夫建议：可考虑增加国际化支持，利在千秋。`
    ]
    const comment = comments[Math.floor(Math.random() * comments.length)]
    const rating = Math.floor(Math.random() * 2) + 4 // 4-5星

    await new Promise(resolve => setTimeout(resolve, 600))

    return NextResponse.json({
      rating,
      comment,
      agent: '奉孝',
      personality: '谋士智慧型',
      reviewed_skill: skill_name
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
