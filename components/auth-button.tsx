'use client'

import { useState, useEffect } from 'react'
import { signInWithGithub, signOut, getCurrentUser, User } from '@/lib/supabase'
import { Github, LogOut, User as UserIcon, Loader2 } from 'lucide-react'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const handleLogin = async () => {
    try {
      setLoading(true)
      const newUser = await signInWithGithub()
      setUser(newUser)
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg" disabled>
        <Loader2 className="animate-spin" size={18} />
      </button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <UserIcon size={16} className="text-white" />
            </div>
          )}
          <span className="text-sm font-medium">{user.username}</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 transition" title="退出登录">
          <LogOut size={18} />
        </button>
      </div>
    )
  }

  return (
    <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
      <Github size={18} />
      GitHub登录
    </button>
  )
}
