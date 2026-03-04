-- =====================================================
-- SkillHub China - Supabase 数据库初始化脚本
-- =====================================================
-- 运行方式：打开 Supabase 控制台 -> SQL Editor -> 粘贴并运行
-- =====================================================

-- 创建 skills 表
CREATE TABLE IF NOT EXISTS public.skills (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  github TEXT,
  channel TEXT[] DEFAULT '{"通用"}',
  tags TEXT[] DEFAULT '{}',
  downloads INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS（行级安全策略）
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取
CREATE POLICY "允许所有人读取skills" ON public.skills
  FOR SELECT USING (true);

-- 允许所有人插入
CREATE POLICY "允许所有人插入skills" ON public.skills
  FOR INSERT WITH CHECK (true);

-- 允许所有人更新
CREATE POLICY "允许所有人更新skills" ON public.skills
  FOR UPDATE USING (true);

-- 允许所有人删除
CREATE POLICY "允许所有人删除skills" ON public.skills
  FOR DELETE USING (true);

-- 插入初始数据
INSERT INTO public.skills (name, description, github, channel, tags, downloads, stars) VALUES
('feishu-send', '飞书文件发送技能', 'https://github.com/example/feishu-send', ARRAY['飞书'], ARRAY['文件'], 1250, 48),
('ecommerce-query', '淘宝京东比价', 'https://github.com/example/ecommerce-query', ARRAY['通用'], ARRAY['电商'], 980, 36),
('baidu-ppt', 'AI PPT生成', 'https://github.com/example/baidu-ppt', ARRAY['通用'], ARRAY['PPT'], 2100, 72);
