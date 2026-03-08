'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q')

  useEffect(() => {
    // 重定向到首页并带上搜索参数
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    const queryString = params.toString()
    const newUrl = queryString ? `/?${queryString}` : '/'
    router.replace(newUrl)
  }, [q, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
        <p className="text-xl">正在跳转到搜索结果...</p>
      </div>
    </div>
  )
}
