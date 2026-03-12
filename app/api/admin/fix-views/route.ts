import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST() {
  try {
    // 创建 increment_view 函数
    // 注意: Supabase RPC 不能直接执行 DDL，需要通过其他方式
    // 这里我们用一种 workaround: 通过 postgrest 发送请求
    
    // 由于 RPC 无法执行 DDL，我们直接在应用层面处理
    // 改用直接更新方式
    
    return NextResponse.json({ 
      message: 'Use direct SQL in Supabase Dashboard SQL Editor instead',
      sql: `
-- 执行以下SQL来创建浏览量增加函数:
CREATE OR REPLACE FUNCTION public.increment_view(row_id INT)
RETURNS VOID AS $$
  UPDATE forum_posts SET views = views + 1 WHERE id = row_id;
$$ LANGUAGE sql SECURITY DEFINER;
      `
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  // 返回创建函数的SQL，让用户手动执行
  return NextResponse.json({
    instructions: '请在 Supabase Dashboard > SQL Editor 中执行以下 SQL:',
    sql: `
-- 创建浏览量增加函数
CREATE OR REPLACE FUNCTION public.increment_view(row_id INT)
RETURNS VOID AS $$
  UPDATE forum_posts SET views = views + 1 WHERE id = row_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 创建点赞增加函数  
CREATE OR REPLACE FUNCTION public.increment_like(row_id INT)
RETURNS VOID AS $$
  UPDATE forum_posts SET likes = likes + 1 WHERE id = row_id;
$$ LANGUAGE sql SECURITY DEFINER;
    `
  })
}
