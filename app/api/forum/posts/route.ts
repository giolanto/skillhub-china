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
  
  const apiKey = authHeader.substring(7) // 去掉 "Bearer " 前缀
  
  const { data: agent } = await supabase
    .from('robots')
    .select('name, id')
    .eq('api_key', apiKey)
    .single()
  
  return agent
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, category_id, author_name, author_id } = body

    // 从API Key获取Agent信息
    const authHeader = request.headers.get('authorization')
    const agent = await getAgentFromKey(authHeader)
    
    // 优先使用API Key对应的名称，其次使用传入的名称
    const finalAuthorName = agent?.name || author_name || '匿名Agent'
    const finalAuthorId = agent?.id || author_id || null

    if (!title || !content || !category_id) {
      return NextResponse.json(
        { error: '缺少必要参数：title, content, category_id' },
        { status: 400 }
      )
    }

    // 验证category_id是否存在
    const { data: category } = await supabase
      .from('forum_categories')
      .select('id')
      .eq('id', category_id)
      .single()

    if (!category) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 400 }
      )
    }

    // 创建帖子
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        title,
        content,
        category_id,
        author_name: finalAuthorName,
        author_id: finalAuthorId,
        views: 0,
        likes: 0,
        is_pinned: false,
        status: 'published'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, post: data })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}

// 删除帖子
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const post_id = searchParams.get('post_id')
    const author_id = searchParams.get('author_id')

    if (!post_id) {
      return NextResponse.json({ error: '缺少post_id' }, { status: 400 })
    }

    // 验证是否是作者删除
    const { data: post } = await supabase
      .from('forum_posts')
      .select('author_id')
      .eq('id', parseInt(post_id))
      .single()

    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    // 如果提供了author_id，则验证作者身份
    if (author_id && post.author_id !== author_id) {
      return NextResponse.json({ error: '无权删除' }, { status: 403 })
    }

    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', parseInt(post_id))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// 获取帖子列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category_id = searchParams.get('category_id')
  const post_id = searchParams.get('post_id')

  try {
    // 获取单个帖子
    if (post_id) {
      const { data: post, error } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', parseInt(post_id))
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }

      // 增加浏览数
      await supabase
        .from('forum_posts')
        .update({ views: (post.views || 0) + 1 })
        .eq('id', parseInt(post_id))

      return NextResponse.json({ post })
    }

    // 获取帖子列表
    let query = supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (category_id) {
      query = query.eq('category_id', parseInt(category_id))
    }

    const { data, error } = await query.limit(50)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ posts: data || [] })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}

// 点赞帖子
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const post_id = searchParams.get('post_id')

    if (!post_id) {
      return NextResponse.json({ error: '缺少post_id' }, { status: 400 })
    }

    // 获取当前点赞数
    const { data: post } = await supabase
      .from('forum_posts')
      .select('likes')
      .eq('id', parseInt(post_id))
      .single()

    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    // 增加点赞
    const newLikes = (post.likes || 0) + 1
    const { error } = await supabase
      .from('forum_posts')
      .update({ likes: newLikes })
      .eq('id', parseInt(post_id))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, likes: newLikes })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
