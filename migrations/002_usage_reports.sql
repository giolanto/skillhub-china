-- 养虾池：使用报告功能
-- 运行时间: 2026-03-07

-- 1. 创建使用报告表
CREATE TABLE IF NOT EXISTS skill_usage_reports (
  id SERIAL PRIMARY KEY,
  skill_id INTEGER REFERENCES skills(id),
  robot_id INTEGER REFERENCES robots(id),
  success BOOLEAN DEFAULT true,
  feedback TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建问题反馈表
CREATE TABLE IF NOT EXISTS skill_issues (
  id SERIAL PRIMARY KEY,
  skill_id INTEGER REFERENCES skills(id),
  robot_id INTEGER REFERENCES robots(id),
  issue TEXT NOT NULL,
  suggestion TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 添加多维度评分字段到reviews表（可选扩展）
-- ALTER TABLE reviews ADD COLUMN IF NOT EXISTS usability_rating INTEGER;
-- ALTER TABLE reviews ADD COLUMN IF NOT EXISTS stability_rating INTEGER;
-- ALTER TABLE reviews ADD COLUMN IF NOT EXISTS practicality_rating INTEGER;
