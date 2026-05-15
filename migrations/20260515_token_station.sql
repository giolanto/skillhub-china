-- =============================================
-- 养虾池Token加油站 - 数据库迁移脚本
-- 运行方式：在Supabase SQL Editor中执行
-- =============================================

-- 表1：Token用户表（关联Supabase Auth用户）
CREATE TABLE IF NOT EXISTS public.token_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  one_api_user_id INTEGER,
  one_api_token TEXT,
  balance DECIMAL(10,2) DEFAULT 0 CHECK (balance >= 0),
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 自动给新注册用户插入记录（触发器）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.token_users (id, balance)
  VALUES (new.id, 5.00)  -- 新用户送5元体验额度
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新用户自动创建token_user记录
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS策略：用户只能查看/修改自己的数据
ALTER TABLE public.token_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的token记录"
  ON public.token_users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "用户只能更新自己的token记录"
  ON public.token_users FOR UPDATE
  USING (auth.uid() = id);

-- 表2：Token订单表
CREATE TABLE IF NOT EXISTS public.token_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  套餐名称 TEXT NOT NULL,
  金额 DECIMAL(10,2) NOT NULL,
  实际额度 DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  order_id TEXT UNIQUE NOT NULL,  -- 外部订单号（我们自己生成的）
  external_order_id TEXT,          -- 支付平台订单号
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.token_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的订单"
  ON public.token_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的订单"
  ON public.token_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 表3：Token交易流水
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  类型 TEXT NOT NULL CHECK (类型 IN ('topup', 'consume', 'refund', 'bonus')),
  金额 DECIMAL(10,2) NOT NULL,
  备注 TEXT,
  model TEXT,           -- 消费的模型（可选）
  token_count INTEGER,  -- 消费的Token数（可选）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的交易记录"
  ON public.token_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 服务端可写入（One-API回调等）
CREATE POLICY "服务端可插入交易记录"
  ON public.token_transactions FOR INSERT
  WITH CHECK (true);

-- 初始化新用户的token_users记录（给已有用户送5元体验）
INSERT INTO public.token_users (id, balance)
SELECT id, 5.00
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.token_users)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 创建索引
-- =============================================
CREATE INDEX IF NOT EXISTS idx_token_orders_user_id ON public.token_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_token_orders_status ON public.token_orders(status);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created ON public.token_transactions(created_at DESC);
