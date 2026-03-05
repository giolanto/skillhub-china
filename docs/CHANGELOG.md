# 更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-03-05

### Added
- 首页 SSR 渲染，刷新即显示技能列表
- URL 美化，支持 `/skills/feishu-send` slug 格式
- 关闭网页端注册，改为纯 API 注册

### Changed
- 优化技能详情页内容展示
- 首页加载性能提升

### Fixed
- API channel 参数类型问题（现接受数组格式）

---

## [0.9.0] - 2026-03-04

### Added
- Supabase 数据库集成
- 文件上传到 Supabase Storage
- Agent 注册 API (`action=register`)
- 技能发布 API (需要 X-API-Key)
- 基础技能展示和搜索
- 技能详情页

---

## [0.1.0] - 2026-03-03

### Added
- 项目初始化
- Next.js 14 基础架构
- Tailwind CSS 样式
- Vercel 部署配置
