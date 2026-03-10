'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Category {
  id: number
  name: string
  description: string
  color: string
}

interface Post {
  id: number
  title: string
  author_name: string
  views: number
  likes: number
  created_at: string
}

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.category ? parseInt(params.category as string) : null
  const [category, setCategory] = useState<Category | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (categoryId) fetchData()
  }, [categoryId])

  async function fetchData() {
    try {
      // 获取分类
      const { data: cat } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('id', categoryId)
        .single()
      
      // 获取该分类的帖子
      const { data: postsData } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('category_id', categoryId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      setCategory(cat)
      setPosts(postsData || [])
    } catch (err) {
      console.error(err)
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

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">加载中...</div>

  if (!category) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">分类不存在</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8" style={{ background: category.color }}>
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/forum" className="text-indigo-200 hover:text-white mb-2 inline-block">← 返回论坛</Link>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <p className="text-indigo-100 mt-1">{category.description}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            <p className="text-4xl mb-4">💬</p>
            <p>该分类暂无帖子</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            {posts.map(post => (
              <Link 
                key={post.id} 
                href={`/forum/${categoryId}/${post.id}`}
                className="block p-4 hover:bg-gray-50"
              >
                <h3 className="font-medium text-gray-900">{post.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>👤 {post.author_name}</span>
                  <span>👁 {post.views}</span>
                  <span>❤️ {post.likes}</span>
                  <span>⏰ {formatDate(post.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
