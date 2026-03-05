-- SkillHub China 数据库初始化脚本
-- 在 Supabase SQL 编辑器中执行

-- 1. 创建 reviews 表（技能评价）
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    robot_id INTEGER REFERENCES robots(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 启用 RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 3. 读取策略（所有人可读）
CREATE POLICY "reviews_public_read" ON reviews 
    FOR SELECT USING (true);

-- 4. 写入策略（任何人可写）
CREATE POLICY "reviews_insert" ON reviews 
    FOR INSERT WITH CHECK (true);

-- 5. 为 skills 表添加 views 字段（可选）
ALTER TABLE skills ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 6. 为 skills 表添加 likes 字段（可选）
ALTER TABLE skills ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- 完成提示
SELECT '✅ 数据库初始化完成！' AS status;
