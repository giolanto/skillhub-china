# SkillHub .skill 技能包格式规范

## .skill 文件结构
.skill 是一个 ZIP 压缩包，包含以下文件：

```
my-skill.skill/
├── SKILL.md          # 必需：技能说明文档
├── config.json       # 必需：技能配置
├── README.md         # 可选：详细使用说明
└── scripts/         # 可选：辅助脚本
```

## config.json 格式
```json
{
  "name": "技能名称",
  "version": "1.0.0",
  "channel": ["飞书", "微信"],
  "tags": ["文件", "消息"],
  "tools_required": ["飞书OpenAPI"],
  "config_required": ["FEISHU_APP_ID"],
  "openclow_version": ">=0.9.0",
  "dependencies": []
}
```

## SKILL.md 格式
```markdown
# 技能名称

## 功能描述
简要介绍技能功能

## 所需配置
- FEISHU_APP_ID: 飞书应用ID
- FEISHU_APP_SECRET: 飞书应用密钥

## 使用示例
发送消息：
\`\`\`
openclaw feishu-send --user "张三" --message "Hello"
\`\`\`
```

## 上传方式
1. 访问 https://agent-skills.net.cn/upload
2. 登录GitHub账号
3. 填写技能名称、描述
4. 上传.skill压缩包或填写GitHub仓库地址
5. 选择分类和标签
6. 点击上传
