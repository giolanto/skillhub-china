'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Post {
  id: number
  title: string
  content: string
  author_name: string
  category_id: number
  views: number
  likes: number
  created_at: string
  updated_at: string
}

interface Comment {
  id: number
  content: string
  author_name: string
  created_at: string
}

export default function PostPage() {
  const params = useParams()
  const postId = params.id ? parseInt(params.id as string) : null
  const categoryId = params.category ? parseInt(params.category as string) : null
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (postId) fetchData()
  }, [postId])

  async function fetchData() {
    try {
      // 获取帖子
      const { data: postData } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', postId)
        .single()
      
      // 获取评论
      const { data: commentsData } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      // 增加浏览数
      if (postData) {
        await supabase.rpc('increment_view', { row_id: postId })
      }

      setPost(postData)
      setComments(commentsData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">加载中...</div>

  if (!post) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">帖子不存在</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <Link href={`/forum/${categoryId}`} className="text-indigo-600 hover:text-indigo-800">← 返回列表</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 帖子内容 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
            <span>👤 {post.author_name}</span>
            <span>👁 {post.views}</span>
            <span>❤️ {post.likes}</span>
            <span>⏰ {formatDate(post.created_at)}</span>
          </div>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* 评论 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">💬 评论 ({comments.length})</h2>
          
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无评论</p>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">👤 {comment.author_name}</span>
                    <span className="text-gray-400 text-sm">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
