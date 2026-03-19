---
name: 语音对话
description: 整合语音识别+AI对话+语音合成，实现语音交互。支持飞书语音消息自动处理，语音输入自动识别并用语音回复。
---

# 🎙️ 语音对话

整合 Parakeet 语音识别 + AI 对话 + Edge TTS 语音合成，实现语音交互。

## ⚠️ 重要规则

**凡是用语音输入，必须用语音回复！**

收到用户语音 → Parakeet 识别 → 回答问题 → Edge TTS 语音输出

## 功能

- 🎤 语音输入 → 文字（Parakeet/faster-whisper 本地识别）
- 🧠 AI 智能对话
- 🔊 文字回复 → 语音（Edge TTS 云希声音）

## 技术方案

| 环节 | 技术 | 说明 |
|------|------|------|
| 语音识别 | **Parakeet (faster-whisper)** | 本地运行，免费无需 API |
| AI 对话 | MiniMax API | 需要联网 |
| 语音合成 | Edge TTS | 免费微软官方，支持多种音色 |

## 快速开始

### 安装命令

```bash
# 1. 安装依赖
pip install faster-whisper edge-tts

# 2. 下载 Whisper 模型（首次使用自动下载）
# tiny 模型 ~140MB，会在首次识别时自动下载
```

### 代码调用

```python
from voice_chat import voice_chat

# 处理语音消息
text, audio_file = voice_chat("input.ogg", "reply.mp3")
print(f"识别: {text}")
print(f"回复音频: {audio_file}")
```

## 完整依赖安装

### 1. Python 环境要求

- Python 3.9+
- 推荐使用虚拟环境

### 2. 安装依赖包

```bash
# 方式一：逐个安装
pip install faster-whisper
pip install edge-tts

# 方式二：一次性安装所有依赖
pip install faster-whisper edge-tts numpy
```

### 3. 系统依赖（可选）

macOS 用户可能需要安装 ffmpeg：

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# 下载 ffmpeg: https://ffmpeg.org/download.html
```

## 配置说明

### AI 对话配置

在 `voice_chat.py` 中修改 AI 回复逻辑：

```python
# 默认回复（可替换为实际的 AI API 调用）
ai_response = f"收到你的消息：{user_text}"
```

### TTS 音色配置

修改默认音色：

```python
# voice_chat.py 中的配置
DEFAULT_TTS_VOICE = "zh-CN-YunxiNeural"  # 云希 - 成熟男声
```

**可用音色列表：**

| 音色 | 说明 |
|------|------|
| zh-CN-YunxiNeural | 云希 - 成熟男声（推荐） |
| zh-CN-YunyangNeural | 云扬 - 专业男声 |
| zh-CN-XiaoxiaoNeural | 晓晓 - 温柔女声 |
| zh-CN-XiaoyiNeural | 晓伊 - 活泼女声 |

### 模型选择

```python
# voice_chat.py 中修改模型大小
# 可选: tiny, base, small, medium, large
# 越大越准确，但需要更多资源
model_name = "tiny"  # 推荐本地使用
```

| 模型 | 大小 | 速度 | 准确度 |
|------|------|------|--------|
| tiny | ~140MB | 最快 | 基础 |
| base | ~290MB | 快 | 中等 |
| small | ~500MB | 中等 | 较好 |
| medium | ~1.5GB | 慢 | 很好 |
| large | ~3GB | 最慢 | 最佳 |

## 使用方式

### 方式一：复制安装命令给 Agent

```
install https://www.agent-skills.net.cn/skills/409
```

### 方式二：手动下载

官网：https://www.agent-skills.net.cn/skills/409

### 方式三：直接使用脚本

```bash
cd skills/voice-chat
python3 voice_chat.py -i input.ogg -o reply.mp3
```

## 语音对话流程

```
🎤 用户发语音消息
   ↓
📥 下载语音文件 (飞书/微信等)
   ↓
🔄 转换为 WAV 格式 (afconvert)
   ↓
📝 Parakeet 语音转文字
   ↓
🧠 AI 生成回复 (调用大模型)
   ↓
🔊 Edge TTS 文字转语音
   ↓
📋 复制音频到 ~/.openclaw/workspace/
   ↓
🎧 发送语音回复给用户
```

## ⚠️ 飞书发送注意事项

音频文件必须先复制到 `~/.openclaw/workspace/` 目录，否则会发送失败：

```python
import shutil
import os

# 错误 ❌
message(filePath="/tmp/voice.mp3")

# 正确 ✅
workspace = os.path.expanduser("~/.openclaw/workspace/")
shutil.copy("/tmp/voice.mp3", f"{workspace}voice.mp3")
message(filePath=f"{workspace}voice.mp3")
```

## 故障排查

### 问题1：faster-whisper 导入失败

```bash
# 确保 Python 版本 >= 3.9
python --version

# 重新安装
pip uninstall faster-whisper
pip install faster-whisper
```

### 问题2：模型下载失败

```bash
# 手动下载模型
from faster_whisper import WhisperModel
model = WhisperModel("tiny", device="cpu")
```

### 问题3：音频格式不支持

```bash
# 使用 ffmpeg 转换
ffmpeg -i input.ogg -acodec pcm_s16le -ar 16000 output.wav
```

### 问题4：Edge TTS 生成失败

```bash
# 检查网络连接
# Edge TTS 需要联网
pip install --upgrade edge-tts
```

## 注意事项

- ✅ 首次使用需下载 Whisper 模型（tiny 模型 ~140MB）
- ✅ AI 对话需要配置 API Key（可选，默认使用简单回复）
- ✅ 飞书语音消息需配置飞书开放平台 API
- ✅ 支持飞书、微信、Telegram 等平台的语音消息

## 相关技能

- [Edge TTS](https://www.agent-skills.net.cn/skills/408) - 语音合成
- [语音转文字](https://www.agent-skills.net.cn/skills/48) - Whisper 识别
