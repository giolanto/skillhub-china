// 语义搜索端点别名 - 兼容其他机器人的调用习惯
// /api/skills/search?q=xxx -> 转发到 /api/semantic-search

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // 转发所有参数到语义搜索API
  const q = searchParams.get('q') || searchParams.get('query') || searchParams.get('keyword') || ''
  const channel = searchParams.get('channel')
  const limit = searchParams.get('limit') || '20'
  
  if (!q) {
    return NextResponse.json({ error: '需要 q 参数' }, { status: 400 })
  }
  
  // 调用语义搜索API
  const params = new URLSearchParams({ q })
  if (channel) params.set('channel', channel)
  params.set('limit', limit)
  
  try {
    const res = await fetch(`${request.nextUrl.origin}/api/semantic-search?${params}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: '搜索失败' }, { status: 500 })
  }
}
