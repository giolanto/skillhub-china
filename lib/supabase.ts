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

// 客户端认证函数
export function signInWithGithub(): User {
  const mockUser: User = {
    id: 'user_' + Date.now(),
    username: 'GitHub用户',
    avatar_url: 'https://github.com/ghost.png',
    github_username: 'github_user',
    created_at: new Date().toISOString()
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('skillhub_user', JSON.stringify(mockUser))
  }
  return mockUser
}

export function signOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('skillhub_user')
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('skillhub_user')
  return userStr ? JSON.parse(userStr) : null
}
