# 飞书定时推送

定时向飞书群聊或用户发送消息，支持cron表达式。

## 配置

在OpenClaw中配置飞书机器人Webhook：
- 飞书群聊 → 群设置 → 智能助手 → 添加机器人 → 自定义机器人 → Webhook

## 使用

```yaml
skill: feishu-scheduler
params:
  webhook: "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
  message: "定时消息内容"
  cron: "0 9 * * *"  # 每天9点
```

或手动触发：

```yaml
skill: feishu-scheduler
params:
  webhook: "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
  message: "立即发送"
  cron: "now"
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| webhook | ✅ | 飞书机器人Webhook地址 |
| message | ✅ | 消息内容，支持文本 |
| cron | ❌ | Cron表达式，"now"表示立即发送，默认"now" |

## 示例

每天早上9点自动发送日报：
```yaml
skill: feishu-scheduler
params:
  webhook: "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
  message: "📊 今日工作汇总"
  cron: "0 9 * * *"
```