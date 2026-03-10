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

// PUT /api/forum/posts/:id - 点赞
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const postId = parseInt(params.id)
  
  try {
    // 获取当前点赞数
    const { data: post } = await supabase
      .from('forum_posts')
      .select('likes')
      .eq('id', postId)
      .single()

    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    // 增加点赞
    const newLikes = (post.likes || 0) + 1
    const { error } = await supabase
      .from('forum_posts')
      .update({ likes: newLikes })
      .eq('id', postId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, likes: newLikes })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET /api/forum/posts/:id - 获取帖子详情
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const postId = parseInt(params.id)
  
  try {
    const { data: post, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // 增加浏览数
    await supabase
      .from('forum_posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', postId)

    // 获取评论
    const { data: comments } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    return NextResponse.json({ post, comments: comments || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/forum/posts/:id - 删除帖子
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const postId = parseInt(params.id)
  
  try {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
