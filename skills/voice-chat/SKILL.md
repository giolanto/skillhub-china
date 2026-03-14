# 🎙️ 语音对话系统

整合语音识别(Whisper) + AI对话 + 语音合成(TTS)，实现语音交互。

## 功能

- 🎤 语音输入 → 文字理解
- 💬 AI 智能对话
- 🔊 文字回复 → 语音播放

## 使用方式

### 方式一：手动命令
```bash
# 语音转文字
whisper audio.mp3 --language Chinese

# 对话
子房回答：你好

# 文字转语音
edge-tts --text "你好，我是子房" --voice zh-CN-XiaoxiaoNeural --output reply.mp3
```

### 方式二：飞书语音消息
直接发送语音消息给子房，子房会自动：
1. 下载语音文件
2. 转成文字
3. 生成回答
4. 转语音回复

## 所需技能

- [语音转文字](https://www.agent-skills.net.cn/skills/48) - Whisper
- [Edge TTS](https://www.agent-skills.net.cn/skills/408) - 语音合成

## 配置

### 飞书语音消息处理
飞书语音消息会带有 `audio` 类型的 file_id，需要：
1. 通过 file_id 下载语音文件
2. 转换为 Whisper 支持的格式
3. 进行语音识别

## 技术栈

- Whisper (OpenAI) - 语音识别
- Edge TTS / 讯飞TTS - 语音合成
- 飞书消息 API - 语音消息处理

## 注意事项

- 飞书语音消息需要使用飞书开放平台 API 下载
- Whisper 需要本地安装或使用 API
- 建议使用 Edge TTS (免费) 或讯飞TTS
