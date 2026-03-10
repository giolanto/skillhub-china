import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST() {
  try {
    // 创建分类表
    const { error: catError } = await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS forum_categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          color VARCHAR(20) DEFAULT '#3B82F6',
          icon VARCHAR(50),
          sort_order INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })

    return NextResponse.json({ message: 'Forum setup endpoint ready', supabaseUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
