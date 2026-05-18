// =============================================
// Token API Keys 管理
// POST /api/token/keys     - 创建新Key
// GET  /api/token/keys     - 列出用户所有Key
// DELETE /api/token/keys   - 删除Key
// =============================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// 生成API Key
function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = `sk-ts-${crypto.randomBytes(16).toString('hex')}`
  const hash = crypto.createHash('sha256').update(raw).digest('hex')
  const prefix = raw.slice(0, 14) // sk-ts-xxxxxxxxxxxx
  return { raw, hash, prefix }
}

// 从请求中获取当前用户（通过Authorization header中的临时token）
// 由于Next.js API路由没有直接的auth middleware，这里通过header传userId
// 实际生产环境建议用Supabase Auth的session验证
async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  // 方法1：通过Supabase Auth的access_token
  const authHeader = req.headers.get('authorization') || ''
  if (!authHeader.startsWith('Bearer ')) return null
  
  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    // 方法2：降级通过x-user-id header（仅用于开发/测试）
    return null
  }
  return user.id
}

// 获取当前用户的真实ApiKey（用于验证用户身份）
// 从 cookie 或 Authorization: Bearer <anon_key> 中获取 Supabase session
function getSupabaseClient(req: NextRequest) {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// 创建新API Key
export async function POST(req: NextRequest) {
  try {
    // 获取当前用户
    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseServiceKey)
    
    // 通过 Authorization header 获取用户身份（Supabase Auth token）
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()
    
    if (!token) {
      return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 })
    }

    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 })
    }

    const body = await req.json()
    const name = body?.name?.trim() || '默认Key'

    // 生成Key
    const { raw, hash, prefix } = generateApiKey()

    // 存入数据库
    const { data, error } = await supabase
      .from('token_api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: hash,
        key_prefix: prefix,
      })
      .select('id, name, key_prefix, created_at, is_active')
      .single()

    if (error) {
      if (error.message.includes('unique')) {
        return NextResponse.json({ error: '该名称的Key已存在，请换一个名称' }, { status: 400 })
      }
      console.error('[Token Keys] 创建失败', error)
      return NextResponse.json({ error: '创建失败，请重试' }, { status: 500 })
    }

    // 返回完整Key（仅此时可查看，存储后无法找回）
    return NextResponse.json({
      id: data.id,
      name: data.name,
      api_key: raw, // 完整key，仅返回这一次
      key_prefix: data.key_prefix,
      created_at: data.created_at,
    })

  } catch (err) {
    console.error('[Token Keys] POST异常', err)
    return NextResponse.json({ error: '系统异常' }, { status: 500 })
  }
}

// 获取用户所有API Key
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('token_api_keys')
      .select('id, name, key_prefix, last_used_at, created_at, is_active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Token Keys] 查询失败', error)
      return NextResponse.json({ error: '查询失败' }, { status: 500 })
    }

    return NextResponse.json({ keys: data || [] })

  } catch (err) {
    console.error('[Token Keys] GET异常', err)
    return NextResponse.json({ error: '系统异常' }, { status: 500 })
  }
}

// 删除API Key
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: '缺少Key ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('token_api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', user.id) // 确保只能删除自己的key

    if (error) {
      console.error('[Token Keys] 删除失败', error)
      return NextResponse.json({ error: '删除失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[Token Keys] DELETE异常', err)
    return NextResponse.json({ error: '系统异常' }, { status: 500 })
  }
}