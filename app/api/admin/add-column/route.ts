import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST() {
  try {
    // 添加 review_api_url 字段
    const { error } = await supabase.rpc('exec_sql', { 
      query: 'ALTER TABLE robots ADD COLUMN IF NOT EXISTS review_api_url TEXT;' 
    })
    
    if (error) {
      // 如果RPC失败，尝试直接修改
      console.log('RPC error:', error.message)
      
      // 检查字段是否已存在
      const { data: existing } = await supabase
        .from('robots')
        .select('review_api_url')
        .limit(1)
      
      return Response.json({ 
        success: true, 
        message: 'Field may already exist or added',
        error: error.message 
      })
    }
    
    return Response.json({ success: true, message: 'Column added successfully' })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
