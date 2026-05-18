-- =============================================
-- Token加油站 - API Keys 表
-- 用于存储用户的API Key（单向哈希存储）
-- =============================================

-- API Keys表
CREATE TABLE IF NOT EXISTS public.token_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '默认Key',
  key_hash TEXT NOT NULL,          -- SHA256哈希后的key（用于验证）
  key_prefix TEXT NOT NULL,        -- key的前8位（用于显示，如 sk-xxxx-xxxx）
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, name)            -- 同一用户下key名称不能重复
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_token_api_keys_user_id ON public.token_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_token_api_keys_hash ON public.token_api_keys(key_hash);

-- RLS
ALTER TABLE public.token_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的Keys"
  ON public.token_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能管理自己的Keys"
  ON public.token_api_keys FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- Token用量日志表（每日汇总，方便Dashboard展示）
-- =============================================
CREATE TABLE IF NOT EXISTS public.token_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  date DATE NOT NULL,                    -- 日期（用于聚合）
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0,          -- 消费金额
  request_count INTEGER DEFAULT 0,       -- 请求次数
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, model, date)           -- 同一用户+模型+日期唯一
);

CREATE INDEX IF NOT EXISTS idx_token_usage_log_user_date ON public.token_usage_log(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_log_model ON public.token_usage_log(model);

ALTER TABLE public.token_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的用量"
  ON public.token_usage_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的用量"
  ON public.token_usage_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的用量"
  ON public.token_usage_log FOR UPDATE
  USING (auth.uid() = user_id);