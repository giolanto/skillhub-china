import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function hideApiKeys(s: string): string {
  if (!s) return s
  return s.replace(/sk-[A-Za-z0-9]{20,}/g, 'sk-****')
}

export async function GET(): Promise<Response> {
  try {
    const { data: skills, error } = await supabase
      .from('skills')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '数据库错误',
        details: error.message 
      }, { status: 500 })
    }
    
    const skillList = skills || []
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SkillHub</title></head><body>
    <h1>🤖 SkillHub API</h1><p>技能数量: ${skillList.length}</p><hr>
    ${skillList.map((s: any) => `<div><h3>${s.name}</h3><p>${s.description || ''}</p></div>`).join('')}
    </body></html>`
    return new Response(html, { headers: { 'Content-Type': 'text/html' } })
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误',
      details: err.message 
    }, { status: 500 })
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: any = await request.json()
    const { name, description, github, channel, tags } = body
    
    if (!name) {
      return NextResponse.json({ success: false, error: '需要name参数' }, { status: 400 })
    }
    
    const newSkill = {
      name,
      description: hideApiKeys(description || ''),
      github: hideApiKeys(github || ''),
      channel: channel || ['通用'],
      tags: tags || [],
      downloads: 0,
      stars: 0,
    }
    
    const { data, error } = await supabase
      .from('skills')
      .insert([newSkill])
      .select()
    
    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '数据库插入失败',
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: '技能发布成功', data: data?.[0] })
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: '请求错误',
      details: err.message 
    }, { status: 400 })
  }
}
