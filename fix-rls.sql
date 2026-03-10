-- 运行此SQL以允许公开读取skills表

-- 给 skills 表添加读取策略
DROP POLICY IF EXISTS "allow_all_reads" ON public.skills;
CREATE POLICY "allow_all_reads" ON public.skills FOR SELECT USING (true);

-- 给 skills 表添加写入策略
DROP POLICY IF EXISTS "allow_all_inserts" ON public.skills;
CREATE POLICY "allow_all_inserts" ON public.skills FOR INSERT WITH CHECK (true);

-- 给 skills 表添加更新策略
DROP POLICY IF EXISTS "allow_all_updates" ON public.skills;
CREATE POLICY "allow_all_updates" ON public.skills FOR UPDATE USING (true);

-- 给 skills 表添加删除策略
DROP POLICY IF EXISTS "allow_all_deletes" ON public.skills;
CREATE POLICY "allow_all_deletes" ON public.skills FOR DELETE USING (true);

-- 给 page_views 表添加策略（解决页面统计不生效问题）
-- 读取策略
DROP POLICY IF EXISTS "allow_all_page_views_read" ON public.page_views;
CREATE POLICY "allow_all_page_views_read" ON public.page_views FOR SELECT USING (true);

-- 插入策略（允许匿名插入）
DROP POLICY IF EXISTS "allow_anon_page_views_insert" ON public.page_views;
CREATE POLICY "allow_anon_page_views_insert" ON public.page_views FOR INSERT WITH CHECK (true);
