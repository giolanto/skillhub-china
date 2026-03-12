-- =====================================================
-- 养虾池论坛数据库 - 迁移脚本
-- 运行方式: Supabase Dashboard > SQL Editor > 粘贴执行
-- =====================================================

-- 1. 创建分类表
CREATE TABLE IF NOT EXISTS forum_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3B82F6',
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建帖子表
CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_name VARCHAR(100) DEFAULT '匿名用户',
  author_id VARCHAR(100),
  category_id INT REFERENCES forum_categories(id),
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建评论表
CREATE TABLE IF NOT EXISTS forum_comments (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name VARCHAR(100) DEFAULT '匿名用户',
  author_id VARCHAR(100),
  parent_id INT REFERENCES forum_comments(id),
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 启用RLS安全策略
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

-- 5. 分类表策略
DROP POLICY IF EXISTS "public_read_categories" ON forum_categories;
CREATE POLICY "public_read_categories" ON forum_categories FOR SELECT USING (true);

-- 6. 帖子表策略
DROP POLICY IF EXISTS "public_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "public_insert_posts" ON forum_posts;
CREATE POLICY "public_read_posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "public_insert_posts" ON forum_posts FOR INSERT WITH CHECK (true);

-- 7. 评论表策略
DROP POLICY IF EXISTS "public_read_comments" ON forum_comments;
DROP POLICY IF EXISTS "public_insert_comments" ON forum_comments;
CREATE POLICY "public_read_comments" ON forum_comments FOR SELECT USING (true);
CREATE POLICY "public_insert_comments" ON forum_comments FOR INSERT WITH CHECK (true);

-- 8. 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_posts_category ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON forum_comments(post_id);

-- 9. 插入默认分类
INSERT INTO forum_categories (name, description, color, icon, sort_order) VALUES 
  ('💬 经验分享', '分享Agent开发和使用经验', '#10B981', 'lightbulb', 1),
  ('❓ 问题求助', '遇到问题寻求帮助', '#F59E0B', 'question', 2),
  ('✨ 功能建议', '对养虾池提出建议', '#8B5CF6', 'sparkles', 3),
  ('🎉 展示台', '展示自己开发的Agent', '#EC4899', 'rocket', 4)
ON CONFLICT DO NOTHING;

-- 10. 创建浏览量增加函数 (2026-03-12 新增)
CREATE OR REPLACE FUNCTION public.increment_view(row_id INT)
RETURNS VOID AS $$
  UPDATE forum_posts SET views = views + 1 WHERE id = row_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 11. 创建点赞增加函数 (2026-03-12 新增)
CREATE OR REPLACE FUNCTION public.increment_like(row_id INT)
RETURNS VOID AS $$
  UPDATE forum_posts SET likes = likes + 1 WHERE id = row_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 12. 验证结果
SELECT '分类表数据:' as info;
SELECT * FROM forum_categories;

SELECT '✅ 论坛数据库创建完成！' as result;
