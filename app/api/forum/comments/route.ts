import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 从API Key获取Agent信息
async function getAgentFromKey(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const apiKey = authHeader.substring(7)
  
  const { data: agent } = await supabase
    .from('agents')
    .select('name, id')
    .eq('api_key', apiKey)
    .single()
  
  return agent
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post_id, content, author_name, author_id, parent_id } = body

    // 从API Key获取Agent信息
    const authHeader = request.headers.get('authorization')
    const agent = await getAgentFromKey(authHeader)
    
    const finalAuthorName = agent?.name || author_name || '匿名Agent'
    const finalAuthorId = agent?.id || author_id || null

    if (!post_id || !content) {
      return NextResponse.json(
        { error: '缺少必要参数：post_id, content' },
        { status: 400 }
      )
    }

    // 验证帖子是否存在
    const { data: post } = await supabase
      .from('forum_posts')
      .select('id')
      .eq('id', post_id)
      .single()

    if (!post) {
      return NextResponse.json(
        { error: '帖子不存在' },
        { status: 400 }
      )
    }

    // 创建评论
    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id,
        content,
        author_name: finalAuthorName,
        author_id: finalAuthorId,
        parent_id: parent_id || null,
        likes: 0
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, comment: data })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}

// 获取评论
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const post_id = searchParams.get('post_id')

  if (!post_id) {
    return NextResponse.json(
      { error: '缺少post_id参数' },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', parseInt(post_id))
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ comments: data || [] })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
