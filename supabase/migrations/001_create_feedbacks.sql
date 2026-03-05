-- SkillHub China 反馈表结构
-- 请在 Supabase SQL Editor 中执行

CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'suggestion', 'other')),
  content TEXT NOT NULL,
  contact TEXT,
  skill_id INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented', 'rejected')),
  created_at TIMESTAMP DEFAULT now()
);

-- 启用RLS
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 允许所有人提交反馈
CREATE POLICY "Allow insert for feedbacks" ON feedbacks
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 允许公开读取（可选，展示反馈）
CREATE POLICY "Allow select for feedbacks" ON feedbacks
  FOR SELECT USING (true);

-- 允许服务角色完全访问
CREATE POLICY "Allow all for service role" ON feedbacks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);
