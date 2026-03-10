const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.fbqpbobsqwcgzbwyeisx.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'zuoletao@1104',
});

async function createForumTables() {
  const client = await pool.connect();
  
  try {
    // 创建分类表
    await client.query(`
      CREATE TABLE IF NOT EXISTS forum_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        color VARCHAR(20) DEFAULT '#3B82F6',
        icon VARCHAR(50),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ forum_categories created');

    // 创建帖子表
    await client.query(`
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
    `);
    console.log('✅ forum_posts created');

    // 创建评论表
    await client.query(`
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
    `);
    console.log('✅ forum_comments created');

    // 启用RLS
    await client.query(`ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;`);
    await client.query(`ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;`);
    await client.query(`ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;`);
    console.log('✅ RLS enabled');

    // 分类表策略
    await client.query(`DROP POLICY IF EXISTS "public_read_categories" ON forum_categories;`);
    await client.query(`CREATE POLICY "public_read_categories" ON forum_categories FOR SELECT USING (true);`);
    
    // 帖子表策略
    await client.query(`DROP POLICY IF EXISTS "public_read_posts" ON forum_posts;`);
    await client.query(`DROP POLICY IF EXISTS "public_insert_posts" ON forum_posts;`);
    await client.query(`CREATE POLICY "public_read_posts" ON forum_posts FOR SELECT USING (true);`);
    await client.query(`CREATE POLICY "public_insert_posts" ON forum_posts FOR INSERT WITH CHECK (true);`);
    
    // 评论表策略
    await client.query(`DROP POLICY IF EXISTS "public_read_comments" ON forum_comments;`);
    await client.query(`DROP POLICY IF EXISTS "public_insert_comments" ON forum_comments;`);
    await client.query(`CREATE POLICY "public_read_comments" ON forum_comments FOR SELECT USING (true);`);
    await client.query(`CREATE POLICY "public_insert_comments" ON forum_comments FOR INSERT WITH CHECK (true);`);
    console.log('✅ RLS policies created');

    // 创建索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_posts_category ON forum_posts(category_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_posts_created ON forum_posts(created_at DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_post ON forum_comments(post_id);`);
    console.log('✅ Indexes created');

    // 插入默认分类
    await client.query(`
      INSERT INTO forum_categories (name, description, color, icon, sort_order) VALUES 
        ('💬 经验分享', '分享Agent开发和使用经验', '#10B981', 'lightbulb', 1),
        ('❓ 问题求助', '遇到问题寻求帮助', '#F59E0B', 'question', 2),
        ('✨ 功能建议', '对养虾池提出建议', '#8B5CF6', 'sparkles', 3),
        ('🎉 展示台', '展示自己开发的Agent', '#EC4899', 'rocket', 4)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Default categories inserted');

    // 查询分类
    const categories = await client.query('SELECT * FROM forum_categories ORDER BY sort_order');
    console.log('\n📋 分类列表:');
    categories.rows.forEach(c => console.log(`  ${c.id}. ${c.name} - ${c.description}`));

    console.log('\n🎉 论坛数据库创建完成！');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createForumTables();
