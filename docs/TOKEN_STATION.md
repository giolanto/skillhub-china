# 🦐 养虾池Token加油站 - 项目规格说明书

## 一、项目概述

**项目名称**：养虾池Token加油站（Token Station）
**定位**：为养虾池用户提供稳定、合规、低成本的AI Token购买与分发服务
**二级域名**：`api.agent-skills.net.cn`（One-API管理后台）
**页面入口**：`agent-skills.net.cn/token`

## 二、系统架构

```
用户端 (agent-skills.net.cn)
├── /token           ← Token加油站首页（套餐展示）
├── /token/docs      ← API调用文档
└── /token/dashboard ← 用户控制台（查额度/充值/API Key）

分发层 (api.agent-skills.net.cn)
└── One-API Docker容器
    ├── 统一API接口（OpenAI兼容格式）
    ├── 用户管理 / 额度管理
    └── 渠道管理（接入各模型官方Token）

数据层
├── Supabase：用户账号 + 订单 + 充值记录
└── One-API内置SQLite/MySQL：额度管理

支付层
└── 易支付/码支付 API → 回调通知 → Supabase充值
```

## 三、支持的AI模型（One-API渠道配置）

| 模型 | 官方来源 | 备注 |
|------|---------|------|
| GPT-4o | OpenAI | 主力渠道 |
| Claude 3.5 Sonnet | Anthropic | 主力渠道 |
| Gemini 1.5 Pro | Google | 备用渠道 |
| DeepSeek Chat | 硅基流动/官方 | 低价渠道 |
| 智谱 GLM-4 | 智谱AI | 国内合规 |
| 通义千问 | 阿里云百炼 | 国内合规 |
| MiniMax | MiniMax官方 | 主公已有Key |

## 四、产品设计

### 4.1 套餐体系

| 套餐名称 | 价格 | 实际到账 | 赠送 | 适用场景 |
|---------|------|---------|------|---------|
| 体验套餐 | ¥5 | ¥5 | 0% | 尝鲜体验 |
| 基础套餐 | ¥50 | ¥55 | 10% | 个人日常 |
| 进阶套餐 | ¥200 | ¥240 | 20% | 开发者 |
| 专业套餐 | ¥500 | ¥650 | 30% | 小团队/重度用户 |
| 企业套餐 | ¥1000 | ¥1400 | 40% | 正式商用 |

**定价策略**：
- 以硅基流动为基准，加价15-30%服务费
- 硅基流动DeepSeek免费 → 我们收服务费
- 主打"稳定+省心+养虾池生态内使用"

### 4.2 页面结构

```
/token（首页）
├── Hero区：标语 + 免费体验按钮
├── 套餐卡片：5个套餐，横向排列
├── 支持模型列表：图标+名称
├── 使用场景说明
├── API文档入口
└── Footer

/token/docs（API文档）
├── 快速开始（获取API Key）
├── 调用示例（cURL/Python/JS）
├── 模型列表与价格表
└── 错误码说明

/token/dashboard（用户控制台）
├── 余额展示
├── 消费记录
├── API Key管理（生成/删除）
└── 充值入口
```

## 五、技术实现

### 5.1 One-API 部署

**服务器要求**：
- 推荐：阿里云/腾讯云 2核4G
- 系统：Ubuntu 22.04
- 域名：api.agent-skills.net.cn（需ICP备案解析）

**Docker部署命令**：
```bash
# SSH登录服务器后执行
sudo apt update && sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker

# 创建数据目录
mkdir -p ~/one-api/data

# 启动One-API
docker run -d \
  --name one-api \
  --restart always \
  -p 3000:3000 \
  -e TZ=Asia/Shanghai \
  -e SESSION_SECRET="随机字符串" \
  -v ~/one-api/data:/data \
  justsong/one-api

# 配置Nginx反向代理（api.agent-skills.net.cn）
# 配置SSL证书（Let's Encrypt）
```

**Nginx配置要点**：
- 反向代理到 localhost:3000
- 申请SSL证书（HTTPS必须）
- 配置流控（防滥用）

### 5.2 养虾池 /token 页面

**技术栈**：Next.js 14 + Tailwind CSS（复用现有技术栈）

**新增文件结构**：
```
app/token/
├── page.tsx              ← Token加油站首页
├── docs/page.tsx         ← API文档页
└── dashboard/page.tsx   ← 用户控制台

app/api/token/
├── key/route.ts         ← 获取用户API Key
├── balance/route.ts     ← 查询余额
├── webhook/route.ts     ← 支付回调
└── create-order/route.ts ← 创建订单
```

### 5.3 数据模型（Supabase）

**表1：token_users（关联现有users表）**
```sql
create table token_users (
  id uuid primary key references auth.users(id),
  one_api_user_id integer,        -- One-API用户ID
  one_api_token text,              -- One-API访问Token
  balance decimal(10,2) default 0, -- 余额（元）
  total_spent decimal(10,2) default 0,
  created_at timestamptz default now()
);
```

**表2：token_orders**
```sql
create table token_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
 套餐名称 text,
  金额 decimal(10,2),
  实际额度 decimal(10,2),
  状态 text default 'pending', -- pending/paid/cancelled
  order_id text unique,         -- 外部订单号
  paid_at timestamptz,
  created_at timestamptz default now()
);
```

**表3：token_transactions**
```sql
create table token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  类型 text, -- topup/consume/refund
  金额 decimal(10,2),
  备注 text,
  created_at timestamptz default now()
);
```

## 六、合规方案

### 6.1 ICP备案
- 域名 agent-skills.net.cn 已完成ICP备案
- api.agent-skills.net.cn 作为二级域名，无需单独备案

### 6.2 支付合规
- 使用国内正规支付渠道（易支付/码支付）
- 所有交易走微信支付/支付宝
- 不涉及跨境结算

### 6.3 服务条款
- 用户需同意《Token服务协议》方可购买
- 明确禁止：非法用途、暴力内容、违规调用
- 保留封禁违规账号权利

## 七、运营策略

### 7.1 冷启动（0→1阶段）
- 新用户注册送 ¥5 体验额度
- 与"新手礼包Agent技能"打包推广
- 在养虾池首页增加Token入口banner

### 7.2 增长阶段（1→100用户）
- 推出"推荐返利"：推荐1人送¥10额度
- 套餐折扣活动（节假日/新模型上线）
- 开发者社区推广

### 7.3 盈利测算
- 目标毛利率：20-30%
- 固定成本：VPS约¥200/月
- 盈亏平衡点：约¥1000/月流水

## 八、开发计划

### Phase 1（本周）：基础设施 ✅
- [ ] VPS购买+One-API部署
- [ ] 域名解析+SSL配置
- [ ] One-API基础配置（管理员账号+渠道）
- [ ] 养虾池 /token 首页UI

### Phase 2（下周）：核心功能
- [ ] 用户认证（GitHub登录复用）
- [ ] /token/dashboard 用户控制台
- [ ] 支付接口对接（易支付/码支付）
- [ ] 支付回调+自动充值

### Phase 3（持续迭代）
- [ ] 推广文案优化
- [ ] 模型渠道扩展
- [ ] 运营监控面板
- [ ] 推荐返利系统

## 九、注意事项

⚠️ **One-API的合规提醒**：
- 本项目为技术基础设施，用户需自备官方渠道Token
- 严禁使用黑卡/盗刷/逆向获取Token
- 禁止对中国地区用户提供未备案的生成式AI服务（仅限API分发）
- 建议主要服务企业用户（有备案的企业）
