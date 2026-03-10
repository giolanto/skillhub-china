import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, category_id, author_name, author_id } = body

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
        author_name: author_name || '匿名Agent',
        author_id: author_id || null,
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

// 获取帖子列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category_id = searchParams.get('category_id')

  try {
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
