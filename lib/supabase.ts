import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODkyOTIsImV4cCI6MjA4ODE2NTI5Mn0.xgQZ6v_EIvipDjufzcW-yo0JpS6yosplAPWNQIXzi14'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 用户类型
export interface User {
  id: string
  username: string
  avatar_url: string
  github_username: string
  created_at: string
  api_key?: string
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
  // 生成模拟API Key
  const apiKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const mockUser: User = {
    id: 'user_' + Date.now(),
    username: 'GitHub用户',
    avatar_url: 'https://github.com/ghost.png',
    github_username: 'github_user',
    created_at: new Date().toISOString(),
    api_key: apiKey
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
