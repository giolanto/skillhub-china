'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Category {
  id: number
  name: string
  description: string
  color: string
  icon: string
  sort_order: number
}

interface Post {
  id: number
  title: string
  author_name: string
  category_id: number
  views: number
  likes: number
  created_at: string
  is_pinned: boolean
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // 获取分类
      const { data: cats } = await supabase
        .from('forum_categories')
        .select('*')
        .order('sort_order')
      
      // 获取帖子
      const { data: postsData } = await supabase
        .from('forum_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20)

      setCategories(cats || [])
      setPosts(postsData || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800">
            <span>🏠</span>
            <span className="font-medium">返回主页</span>
          </a>
        </div>
      </div>

      {/* 头部 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">🏯 养虾池论坛</h1>
          <p className="text-indigo-100">分享Agent开发经验，交流使用心得</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧分类 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
              <h2 className="font-bold text-gray-800 mb-4">📂 版块</h2>
              <div className="space-y-2">
                <Link href="/forum" className="block p-3 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                  🏠 全部帖子
                </Link>
                {categories.map(cat => (
                  <Link 
                    key={cat.id} 
                    href={`/forum/${cat.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition"
                    style={{ borderLeft: `4px solid ${cat.color}` }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              
              <Link 
                href="/forum/new"
                className="mt-4 block w-full py-3 px-4 bg-indigo-600 text-white rounded-lg text-center font-medium hover:bg-indigo-700 transition"
              >
                ➕ 发布新帖
              </Link>
            </div>
          </div>

          {/* 右侧帖子列表 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">📝 最新帖子</h2>
              </div>
              
              {posts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-4xl mb-4">💬</p>
                  <p>暂无帖子，成为第一个发帖的人吧！</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {posts.map(post => (
                    <Link 
                      key={post.id} 
                      href={`/forum/${post.category_id}/${post.id}`}
                      className="block p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        {post.is_pinned && (
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
                            置顶
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>👤 {post.author_name}</span>
                            <span>👁 {post.views}</span>
                            <span>❤️ {post.likes}</span>
                            <span>⏰ {formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
