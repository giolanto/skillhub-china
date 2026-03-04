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

// 模拟数据
let mockUsers: User[] = []
let mockSkills: Skill[] = [
  { id: 1, name: 'feishu-send', description: '飞书文件发送技能', channel: ['飞书'], tags: ['文件'], downloads: 1250, stars: 48 },
  { id: 2, name: 'ecommerce-query', description: '淘宝京东比价', channel: ['通用'], tags: ['电商'], downloads: 980, stars: 36 },
  { id: 3, name: 'baidu-ppt', description: 'AI PPT生成', channel: ['通用'], tags: ['PPT'], downloads: 2100, stars: 72 },
]

export function getSkills(): Skill[] {
  return mockSkills
}

export function addSkill(skill: Omit<Skill, 'id' | 'downloads' | 'stars'>, userId?: string): Skill {
  const newSkill: Skill = {
    ...skill,
    id: mockSkills.length + 1,
    downloads: 0,
    stars: 0,
    user_id: userId,
    created_at: new Date().toISOString()
  }
  mockSkills.push(newSkill)
  return newSkill
}

export function signInWithGithub(): User {
  const mockUser: User = {
    id: 'user_' + Date.now(),
    username: 'GitHub用户',
    avatar_url: 'https://github.com/ghost.png',
    github_username: 'github_user',
    created_at: new Date().toISOString()
  }
  mockUsers.push(mockUser)
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
