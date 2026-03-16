-- 003_skill_security_audits.sql
-- 安全审核表

CREATE TABLE IF NOT EXISTS skill_security_audits (
  id SERIAL PRIMARY KEY,
  skill_id INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  risks JSONB DEFAULT '[]',
  auditor TEXT,
  audit_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_skill_security_audits_skill_id ON skill_security_audits(skill_id);

-- 启用RLS
ALTER TABLE skill_security_audits ENABLE ROW LEVEL SECURITY;

-- 允许公开读取
CREATE POLICY "Public can read security audits" ON skill_security_audits
  FOR SELECT USING (true);

-- 允许服务角色完全访问
CREATE POLICY "Service role full access" ON skill_security_audits
  FOR ALL USING (true) WITH CHECK (true);
