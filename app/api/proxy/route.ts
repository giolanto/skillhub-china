// =============================================
// Token加油站 - API反向代理
// 将用户请求转发到OneAPI，同时做余额校验和用量计费
// 路径: /api/proxy/* → 转发到 OneAPI
// =============================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ONE_API_BASE_URL = process.env.ONE_API_BASE_URL || 'http://localhost:3000'
const ONE_API_KEY = process.env.ONE_API_KEY || ''

// 模型单价（¥/1K tokens），与 docs/page.tsx 定价保持一致
const MODEL_PRICES: Record<string, number> = {
  'gpt-4o': 0.12, 'gpt-4o-mini': 0.01, 'gpt-4-turbo': 0.30, 'gpt-3.5-turbo': 0.01,
  'claude-3-5-sonnet': 0.11, 'claude-3-opus': 0.50, 'claude-3-haiku': 0.008,
  'gemini-1.5-pro': 0.05, 'gemini-1.5-flash': 0.0025,
  'deepseek-chat': 0.001, 'deepseek-coder': 0.001,
  'glm-4': 0.05, 'glm-4-flash': 0.01,
  'qwen-plus': 0.04, 'qwen-turbo': 0.02,
  'minimax-01': 0.01, 'minimax-06': 0.04,
  'moonshot-v1-8k': 0.03, 'moonshot-v1-32k': 0.06,
}
const DEFAULT_PRICE = 0.05

// 估算消费
function estimateCost(model: string, messages: any[], max_tokens?: number): number {
  const price = MODEL_PRICES[model.toLowerCase()] || DEFAULT_PRICE
  let inputTokens = 0
  for (const msg of messages) {
    const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content || '')
    inputTokens += Math.ceil(content.length / 4)
  }
  const totalTokens = inputTokens + (max_tokens || 1024)
  return (totalTokens / 1000) * price
}

// 解析请求体中的模型名
function extractModel(body: any): string {
  return body?.model || 'gpt-4o'
}

// 通过API Key的SHA256哈希查找用户
async function getUserAndBalanceByKey(rawKey: string): Promise<{ userId: string; balance: number } | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

  const { data: keyRecord } = await supabase
    .from('token_api_keys')
    .select('user_id, is_active')
    .eq('key_hash', keyHash)
    .single()

  if (!keyRecord || !keyRecord.is_active) return null

  // 更新last_used_at
  await supabase
    .from('token_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash)

  const { data: userRecord } = await supabase
    .from('token_users')
    .select('balance')
    .eq('id', keyRecord.user_id)
    .single()

  return { userId: keyRecord.user_id, balance: userRecord?.balance ?? 0 }
}

// 校验API Key
async function validateApiKey(authHeader: string): Promise<{ valid: boolean; userId?: string; balance?: number; error?: string }> {
  if (!authHeader) return { valid: false, error: '缺少 Authorization header' }
  const key = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!key) return { valid: false, error: 'API Key为空' }
  if (key.startsWith('sk-test-')) return { valid: false, error: '请先去控制台申请真实的API Key' }

  const result = await getUserAndBalanceByKey(key)
  if (!result) return { valid: false, error: 'API Key无效或已删除，请前往控制台重新创建' }
  return { valid: true, userId: result.userId, balance: result.balance }
}

// 扣减余额
async function deductBalance(userId: string, amount: number, model: string, tokenCount?: number): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data } = await supabase.from('token_users').select('balance').eq('id', userId).single()
  const currentBalance = data?.balance ?? 0
  const newBalance = Math.round((currentBalance - amount) * 100) / 100

  await supabase.from('token_users').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', userId)
  await supabase.from('token_transactions').insert({
    user_id: userId, 类型: 'consume', 金额: -amount,
    备注: `API调用：${model}`, model, token_count: tokenCount,
  })
  console.log(`[Token消费] 用户${userId}，模型${model}，消费¥${amount.toFixed(4)}，余额剩¥${newBalance}`)
}

// POST /api/proxy/v1/chat/completions
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const validation = await validateApiKey(authHeader)
    if (!validation.valid) {
      return NextResponse.json(
        { error: { message: validation.error, type: 'invalid_request_error', code: 401 } },
        { status: 401 }
      )
    }

    const body = await req.json()
    const model = extractModel(body)
    const estimatedCost = estimateCost(model, body.messages || [], body.max_tokens)

    if (validation.balance! < estimatedCost) {
      return NextResponse.json(
        { error: { message: `余额不足（¥${validation.balance!.toFixed(2)}），请充值后再试`, type: 'invalid_request_error', code: 403 } },
        { status: 403 }
      )
    }

    const path = req.nextUrl.pathname.replace('/api/proxy', '')
    const oneApiUrl = `${ONE_API_BASE_URL}${path}`

    const oneApiResponse = await fetch(oneApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ONE_API_KEY}`,
      },
      body: JSON.stringify(body),
    })

    const responseText = await oneApiResponse.text()

    // 计费（OneAPI返回usage时扣款）
    if (oneApiResponse.ok) {
      try {
        const responseData = JSON.parse(responseText)
        if (responseData.usage) {
          const { prompt_tokens, completion_tokens } = responseData.usage
          const totalTokens = prompt_tokens + completion_tokens
          const actualCost = (totalTokens / 1000) * (MODEL_PRICES[model.toLowerCase()] || DEFAULT_PRICE)
          await deductBalance(validation.userId!, actualCost, model, totalTokens)
        }
      } catch { /* response不是JSON */ }
    }

    return new NextResponse(responseText, {
      status: oneApiResponse.status,
      headers: { 'Content-Type': oneApiResponse.headers.get('Content-Type') || 'application/json' },
    })

  } catch (err) {
    console.error('[Token代理] 异常', err)
    return NextResponse.json({ error: { message: '代理服务异常', type: 'server_error', code: 500 } }, { status: 500 })
  }
}

// GET /api/proxy/v1/models
export async function GET(req: NextRequest) {
  try {
    const path = req.nextUrl.pathname.replace('/api/proxy', '')
    const oneApiUrl = `${ONE_API_BASE_URL}${path}`
    const oneApiResponse = await fetch(oneApiUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ONE_API_KEY}` },
    })
    return new NextResponse(await oneApiResponse.text(), {
      status: oneApiResponse.status,
      headers: { 'Content-Type': oneApiResponse.headers.get('Content-Type') || 'application/json' },
    })
  } catch (err) {
    console.error('[Token代理] GET异常', err)
    return NextResponse.json({ error: { message: '获取模型列表失败', type: 'server_error', code: 500 } }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) { return POST(req) }
export async function DELETE(req: NextRequest) { return POST(req) }