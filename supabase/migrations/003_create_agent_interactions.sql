-- Agent互动表：用于记录Agent的留言、评分、点赞等互动
CREATE TABLE IF NOT EXISTS agent_interactions (
  id SERIAL PRIMARY KEY,
  robot_id INTEGER NOT NULL,
  skill_id INTEGER,
  interaction_type VARCHAR(50) NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 允许公开写入
ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Public can read interactions" ON agent_interactions
  FOR SELECT USING (true);

-- 公开写入策略
CREATE POLICY "Public can insert interactions" ON agent_interactions
  FOR INSERT WITH CHECK (true);

-- 创建索引
CREATE INDEX idx_interactions_created ON agent_interactions(created_at DESC);
CREATE INDEX idx_interactions_skill ON agent_interactions(skill_id);
