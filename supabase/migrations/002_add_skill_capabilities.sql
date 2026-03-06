-- 添加Agent能力标准化字段
-- 运行: cat supabase/migrations/002_add_skill_capabilities.sql | psql -h db.fbqpbobsqwcgzbwyeisx.supabase.co -U postgres -d postgres

-- 1. 添加新字段到skills表
ALTER TABLE skills ADD COLUMN IF NOT EXISTS capabilities TEXT[] DEFAULT '{}';
ALTER TABLE skills ADD COLUMN IF NOT EXISTS inputs TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS outputs TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS dependencies TEXT[] DEFAULT '{}';
ALTER TABLE skills ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT '1.0.0';
ALTER TABLE skills ADD COLUMN IF NOT EXISTS author VARCHAR(100);
ALTER TABLE skills ADD COLUMN IF NOT EXISTS compatibility VARCHAR(50);
ALTER TABLE skills ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW();

-- 2. 更新RLS策略（允许读取新字段）
DROP POLICY IF EXISTS "skills_select_policy" ON skills;
CREATE POLICY "skills_select_policy" ON skills FOR SELECT USING (true);

-- 3. 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_skills_capabilities ON skills USING GIN (capabilities);
CREATE INDEX IF NOT EXISTS idx_skills_dependencies ON skills USING GIN (dependencies);
