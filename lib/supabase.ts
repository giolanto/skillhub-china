import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 用户类型
export interface User {
  id: string
  username: string
  avatar_url: string
  github_username: string
  created_at: string
}

// 技能类型
export interface Skill {
  id: number
  name: string
  description: string
  github: string
  channel: string[]
  tags: string[]
  downloads: number
  stars: number
  user_id?: string
  created_at?: string
}
