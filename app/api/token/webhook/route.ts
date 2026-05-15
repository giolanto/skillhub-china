// 支付回调API
// 支持 易支付/码支付 回调通知

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fbqpbobsqwcgzbwyeisx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// 易支付回调参数
interface PayCallback {
  out_trade_no: string   // 我们的订单号
  trade_no: string       // 第三方订单号
  trade_status: string    // 支付状态 (TRADE_SUCCESS)
  money: string          // 支付金额
  sign: string           // 签名
  sign_type: string
}

const PAY_SECRET = process.env.PAY_SECRET || '' // 支付密钥

// 验证签名
function verifySign(params: PayCallback): boolean {
  const { sign, sign_type, ...rest } = params
  const sorted = Object.keys(rest)
    .sort()
    .filter(k => rest[k as keyof PayCallback] !== '' && k !== 'sign' && k !== 'sign_type')
    .map(k => `${k}=${rest[k as keyof PayCallback]}`)
    .join('&')
  const str = `${sorted}&key=${PAY_SECRET}`
  // MD5签名
  const crypto = require('crypto')
  const expected = crypto.createHash('md5').update(str).digest('hex').toLowerCase()
  return expected === sign.toLowerCase()
}

// 套餐配置
const PLAN_CREDITS: Record<string, number> = {
  '体验套餐': 5,
  '基础套餐': 55,
  '进阶套餐': 240,
  '专业套餐': 650,
  '企业套餐': 1400,
}

export async function POST(req: NextRequest) {
  try {
    const params = await req.json() as PayCallback

    // 1. 验证签名
    if (PAY_SECRET && !verifySign(params)) {
      console.error('[Token支付] 签名验证失败', params)
      return NextResponse.json({ code: 'fail', msg: '签名错误' }, { status: 400 })
    }

    // 2. 验证支付状态
    if (params.trade_status !== 'TRADE_SUCCESS') {
      return NextResponse.json({ code: 'fail', msg: '支付未成功' })
    }

    // 3. 查询订单
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: order, error } = await supabase
      .from('token_orders')
      .select('*')
      .eq('order_id', params.out_trade_no)
      .single()

    if (error || !order) {
      console.error('[Token支付] 订单不存在', params.out_trade_no)
      return NextResponse.json({ code: 'fail', msg: '订单不存在' }, { status: 404 })
    }

    if (order.status === 'paid') {
      // 重复回调，直接返回成功
      return NextResponse.json({ code: 'success', msg: '已处理' })
    }

    // 4. 计算到账额度
    const credits = PLAN_CREDITS[order.套餐名称] || parseFloat(order.实际额度 as unknown as string)

    // 5. 更新订单状态
    await supabase
      .from('token_orders')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('order_id', params.out_trade_no)

    // 6. 给用户充值额度（更新token_users表）
    const { data: tokenUser } = await supabase
      .from('token_users')
      .select('balance')
      .eq('id', order.user_id)
      .single()

    const newBalance = (tokenUser?.balance || 0) + credits

    await supabase
      .from('token_users')
      .upsert({
        id: order.user_id,
        balance: newBalance,
      })
      .eq('id', order.user_id)

    // 7. 记录交易流水
    await supabase
      .from('token_transactions')
      .insert({
        user_id: order.user_id,
        类型: 'topup',
        金额: credits,
        备注: `充值套餐：${order.套餐名称}，支付¥${order.金额}`,
      })

    console.log(`[Token支付] 充值成功：用户${order.user_id}，套餐${order.套餐名称}，到账¥${credits}`)

    return NextResponse.json({ code: 'success', msg: '处理成功' })
  } catch (err) {
    console.error('[Token支付] 异常', err)
    return NextResponse.json({ code: 'fail', msg: '系统错误' }, { status: 500 })
  }
}
