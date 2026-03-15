# 🎙️ Voice Chat

Integrates Parakeet speech recognition + AI dialogue + Edge TTS speech synthesis for voice interaction.

## ⚠️ Important Rule

**Voice input must be responded with voice!**

User voice → Parakeet recognition → Answer → Edge TTS voice output

## Features

- 🎤 Voice input → text (Parakeet/faster-whisper local recognition)
- 🧠 AI intelligent dialogue
- 🔊 Text response → voice (Edge TTS Yunxi voice)

## Technical Solution

| Component | Technology | Description |
|-----------|------------|-------------|
| Speech Recognition | **Parakeet (faster-whisper)** | Local running, free, no API needed |
| AI Dialogue | MiniMax API | Requires internet |
| Speech Synthesis | Edge TTS | Free Microsoft official, multiple voices |

## Quick Start

### Installation

```bash
# Install dependencies
pip install faster-whisper edge-tts numpy
```

### Code Usage

```python
from voice_chat import voice_chat

# Process voice message
text, audio_file = voice_chat("input.ogg", "reply.mp3")
print(f"Recognized: {text}")
print(f"Reply audio: {audio_file}")
```

## Complete Dependencies

### 1. Python Environment

- Python 3.9+
- Recommended: virtual environment

### 2. Install Packages

```bash
# Option 1: Install one by one
pip install faster-whisper
pip install edge-tts

# Option 2: Install all at once
pip install faster-whisper edge-tts numpy
```

### 3. System Dependencies (Optional)

macOS users may need ffmpeg:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download ffmpeg: https://ffmpeg.org/download.html
```

## Configuration

### AI Dialogue Configuration

Modify AI response logic in `voice_chat.py`:

```python
# Default response (can replace with actual AI API call)
ai_response = f"Your message: {user_text}"
```

### TTS Voice Configuration

Modify default voice:

```python
# Configuration in voice_chat.py
DEFAULT_TTS_VOICE = "zh-CN-YunxiNeural"  # Yunxi - mature male voice (recommended)
```

**Available Voices:**

| Voice | Description |
|-------|-------------|
| zh-CN-YunxiNeural | Yunxi - mature male (recommended) |
| zh-CN-YunyangNeural | Yunyang - professional male |
| zh-CN-XiaoxiaoNeural | Xiaoxiao - gentle female |
| zh-CN-XiaoyiNeural | Xiaoyi - lively female |

### Model Selection

```python
# Modify model size in voice_chat.py
# Options: tiny, base, small, medium, larger
# Bigger = more accurate, but needs more resources
model_name = "tiny"  # Recommended for local use
```

| Model | Size | Speed | Accuracy |
|-------|------|-------|----------|
| tiny | ~140MB | Fastest | Basic |
| base | ~290MB | Fast | Medium |
| small | ~500MB | Medium | Good |
| medium | ~1.5GB | Slow | Very Good |
| large | ~3GB | Slowest | Best |

## Usage

### Method 1: Install Command

```
install https://www.agent-skills.net.cn/skills/409
```

### Method 2: Manual Download

Official site: https://www.agent-skills.net.cn/skills/409

### Method 3: Use Script Directly

```bash
cd skills/voice-chat
python3 voice_chat.py -i input.ogg -o reply.mp3
```

## Voice Chat Flow

```
🎤 User sends voice message
   ↓
📥 Download voice file (Feishu/WeChat/etc)
   ↓
🔄 Convert to WAV format (afconvert)
   ↓
📝 Parakeet speech to text
   ↓
🧠 AI generates response (call LLM)
   ↓
🔊 Edge TTS text to speech
   ↓
📋 Copy audio to ~/.openclaw/workspace/
   ↓
🎧 Send voice reply to user
```

## ⚠️ Feishu Sending Note

Audio files must be copied to `~/.openclaw/workspace/` directory first, otherwise sending will fail:

```python
import shutil
import os

# Wrong ❌
message(filePath="/tmp/voice.mp3")

# Correct ✅
workspace = os.path.expanduser("~/.openclaw/workspace/")
shutil.copy("/tmp/voice.mp3", f"{workspace}voice.mp3")
message(filePath=f"{workspace}voice.mp3")
```

## Troubleshooting

### Problem 1: faster-whisper import fails

```bash
# Ensure Python version >= 3.9
python --version

# Reinstall
pip uninstall faster-whisper
pip install faster-whisper
```

### Problem 2: Model download fails

```bash
# Download model manually
from faster_whisper import WhisperModel
model = WhisperModel("tiny", device="cpu")
```

### Problem 3: Audio format not supported

```bash
# Use ffmpeg to convert
ffmpeg -i input.ogg -acodec pcm_s16le -ar 16000 output.wav
```

### Problem 4: Edge TTS generation fails

```bash
# Check network connection
# Edge TTS needs internet
pip install --upgrade edge-tts
```

## Notes

- ✅ First use requires downloading Whisper model (tiny model ~140MB)
- ✅ AI dialogue needs API Key configuration (optional, default uses simple response)
- ✅ Feishu voice messages need Feishu open platform API configuration
- ✅ Supports voice messages from Feishu, WeChat, Telegram and other platforms

## Related Skills

- [Edge TTS](https://www.agent-skills.net.cn/skills/408) - Speech Synthesis
- [Speech to Text](https://www.agent-skills.net.cn/skills/48) - Whisper Recognition
