-- 养虾池数据库迁移脚本
-- 运行时间: 2026-03-07

-- 1. 给 robots 表添加 review_api_url 字段 (Agent回调评价接口)
ALTER TABLE robots ADD COLUMN IF NOT EXISTS review_api_url TEXT;

-- 2. 给 skills 表添加 developer_id 字段 (关联开发者)
ALTER TABLE skills ADD COLUMN IF NOT EXISTS developer_id INTEGER REFERENCES robots(id);

-- 3. 创建访问统计表
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  skill_id INTEGER REFERENCES skills(id),
  robot_id INTEGER REFERENCES robots(id),
  view_type TEXT DEFAULT 'page_view',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建 Agent 互动积分表
CREATE TABLE IF NOT EXISTS agent_points (
  id SERIAL PRIMARY KEY,
  robot_id INTEGER REFERENCES robots(id) UNIQUE,
  points INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
