import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODkyOTIsImV4cCI6MjA4ODE2NTI5Mn0.xgQZ6v_EIvipDjufzcW-yo0JpS6yosplAPWNQIXzi14'

// POST: 记录页面访问
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page, skill_id } = body
    
    // 记录到 page_views 表
    const res = await fetch(`${supabaseUrl}/rest/v1/page_views`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        page: page || '/',
        skill_id: skill_id || null,
        viewed_at: new Date().toISOString()
      })
    })
    
    if (!res.ok) {
      console.error('Page view记录失败:', await res.text())
      return NextResponse.json({ success: false }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Page view错误:', error)
    return NextResponse.json({ error: '记录失败' }, { status: 500 })
  }
}

// GET: 获取访问统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'summary'
    const days = parseInt(searchParams.get('days') || '7')
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    if (type === 'summary') {
      // 获取总访问量
      const totalRes = await fetch(
        `${supabaseUrl}/rest/v1/page_views?select=count`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      )
      const totalData = await totalRes.json()
      const totalViews = Array.isArray(totalData) ? totalData.length : 0
      
      // 获取今日访问量
      const today = new Date().toISOString().split('T')[0]
      const todayRes = await fetch(
        `${supabaseUrl}/rest/v1/page_views?viewed_at=gt.${today}`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      )
      const todayData = await todayRes.json()
      const todayViews = Array.isArray(todayData) ? todayData.length : 0
      
      // 获取热门页面
      const pagesRes = await fetch(
        `${supabaseUrl}/rest/v1/page_views?select=page,skill_id&viewed_at=gt.${cutoffDate.toISOString()}`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      )
      const pagesData = await pagesRes.json()
      
      // 统计页面访问
      const pageStats: Record<string, number> = {}
      if (Array.isArray(pagesData)) {
        for (const p of pagesData) {
          const key = p.skill_id ? `/skills/${p.skill_id}` : (p.page || '/')
          pageStats[key] = (pageStats[key] || 0) + 1
        }
      }
      
      // 排序获取TOP10
      const topPages = Object.entries(pageStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([page, views]) => ({ page, views }))
      
      return NextResponse.json({
        total: totalViews,
        today: todayViews,
        topPages,
        period: days
      })
    }
    
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
