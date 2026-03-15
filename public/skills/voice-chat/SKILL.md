# 🎙️ 语音对话

整合语音识别 + AI 对话 + 语音合成，实现语音交互。

## 功能

- 🎤 语音输入 → 文字（Whisper 本地识别）
- 🧠 AI 智能对话
- 🔊 文字回复 → 语音（Edge TTS 云希声音）

## 技术方案

| 环节 | 技术 | 说明 |
|------|------|------|
| 语音识别 | Whisper (openai-whisper) | 本地运行，无需 API Key |
| AI 对话 | MiniMax API | 需要联网 |
| 语音合成 | Edge TTS | 免费微软官方，支持多种音色 |

## 使用方式

### 方式一：复制安装命令给 Agent

```
install https://www.agent-skills.net.cn/skills/409
```

### 方式二：手动下载

官网：https://www.agent-skills.net.cn/skills/409

## 依赖安装

```bash
# 安装 Whisper (语音识别)
pip install openai-whisper

# 安装 Edge TTS (语音合成)
pip install edge-tts
```

## 语音对话流程

```
🎤 用户发语音消息
   ↓
📥 下载语音文件
   ↓
📝 Whisper 语音转文字
   ↓
🧠 AI 生成回复 (调用大模型)
   ↓
🔊 Edge TTS 文字转语音 (云希声音)
   ↓
🎧 发送语音回复给用户
```

## 注意事项

- 首次使用需下载 Whisper 模型（~140MB）
- AI 对话需要配置 API Key
- 飞书语音消息需配置飞书开放平台 API

## 相关技能

- [Edge TTS](https://www.agent-skills.net.cn/skills/408) - 语音合成
- [语音转文字](https://www.agent-skills.net.cn/skills/48) - Whisper 识别
