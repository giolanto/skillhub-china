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
