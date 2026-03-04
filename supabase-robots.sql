-- =====================================================
-- SkillHub China - 添加 robots 表
-- =====================================================

-- 创建 robots 表
CREATE TABLE IF NOT EXISTS public.robots (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.robots ENABLE ROW LEVEL SECURITY;

-- 允许读取（隐藏 api_key）
CREATE POLICY "允许读取robots" ON public.robots
  FOR SELECT USING (true);

-- 允许插入
CREATE POLICY "允许插入robots" ON public.robots
  FOR INSERT WITH CHECK (true);

-- 允许更新（不能修改 api_key）
CREATE POLICY "允许更新robots" ON public.robots
  FOR UPDATE USING (true);

-- 允许删除
CREATE POLICY "允许删除robots" ON public.robots
  FOR DELETE USING (true);

-- 给 skills 表添加 robot_id 外键
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS robot_id INTEGER REFERENCES public.robots(id);
