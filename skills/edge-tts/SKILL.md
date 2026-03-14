---
name: edge-tts
description: "微软Edge TTS文字转语音工具。免费、稳定、无需API Key。适用于AI语音播报、有声内容生成、语音提醒等场景。"
---

# Edge TTS

微软Edge浏览器内置的文本转语音服务，**免费、稳定、无需API Key**。

## 安装依赖

```bash
pip3 install edge-tts
```

## 快速开始

### 方式一：命令行（推荐）

```bash
# 基本用法
python3 -m edge_tts -t "你好世界" --write-media hello.mp3

# 指定中文语音
python3 -m edge_tts -t "你好" -v "zh-CN-YunyangNeural" --write-media hello.mp3

# 查看所有可用语音
python3 -m edge_tts -l
```

### 方式二：使用封装脚本

```bash
# 复制脚本到你的项目
cp ~/.openclaw/skills/edge-tts/scripts/edge_tts.py ./

# 基本用法
python3 edge_tts.py -t "你好世界" -o hello.mp3

# 指定语音
python3 edge_tts.py -t "你好" -v "zh-CN-YunyangNeural" -o hello.mp3

# 从文件读取
python3 edge_tts.py -f article.txt -o article.mp3

# 生成后发送到飞书
python3 edge_tts.py -t "你好" --send
```

## 推荐语音

### 中文语音

| 语音ID | 名称 | 风格 | 推荐场景 |
|--------|------|------|----------|
| zh-CN-YunyangNeural | 云扬 | 专业可靠 | **默认首选** - 新闻、资讯、播报 |
| zh-CN-YunjianNeural | 云健 | 激情有力 | 体育、演讲、激情内容 |
| zh-CN-YunxiNeural | 云希 | 活泼阳光 | 小说、娱乐、轻松内容 |
| zh-CN-YunxiaNeural | 云希小 | 活泼可爱 | 儿童内容 |
| zh-CN-XiaoxiaoNeural | 晓晓 | 温暖 | 情感内容、温馨提醒 |

### 其他语言

| 语言 | 语音ID |
|------|--------|
| 英文男声 | en-US-JasonNeural |
| 英文女声 | en-US-JennyNeural |
| 日文 | ja-JP-NanamiNeural |
| 韩文 | ko-KR-SunHiNeural |

## Python集成示例

### 基础用法

```python
import subprocess
import os

def text_to_speech(text, voice="zh-CN-YunyangNeural", output="output.mp3"):
    """调用Edge TTS生成语音"""
    cmd = [
        "python3", "-m", "edge_tts",
        "-t", text,
        "-v", voice,
        "--write-media", output
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    return result.returncode == 0 and os.path.exists(output)

# 使用
success = text_to_speech("你好，我是子房", "zh-CN-YunyangNeural", "hello.mp3")
```

### 完整集成（带飞书发送）

```python
import subprocess
import os
import shutil

def edge_tts(text, voice="zh-CN-YunyangNeural", output="/tmp/tts.mp3"):
    """生成语音"""
    cmd = [
        "python3", "-m", "edge_tts",
        "-t", text[:500],  # 建议限制长度
        "-v", voice,
        "--write-media", output
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    return result.returncode == 0

def send_voice_to_feishu(audio_path, target_user):
    """发送语音到飞书"""
    if not os.path.exists(audio_path):
        return False
    
    # 复制到workspace
    dest = os.path.expanduser(f"~/.openclaw/workspace/{os.path.basename(audio_path)}")
    shutil.copy2(audio_path, dest)
    
    # 发送
    openclaw = os.path.expanduser("~/.local/node/22/bin/openclaw")
    cmd = [openclaw, "message", "send", "--channel", "feishu", 
           "--target", target_user, "--media", dest]
    return subprocess.run(cmd).returncode == 0

# 使用
text = "各位好，欢迎收听AI资讯，我是子房"
if edge_tts(text):
    send_voice_to_feishu("/tmp/tts.mp3", "ou_xxx")
```

## 飞书发送规范

### 关键要点

1. **文件位置**: 必须放在 `~/.openclaw/workspace/`
2. **参数**: 使用 `--media` 而非 `--filePath`
3. **大小**: 真实MP3无限制（已测试3.5MB正常）

### 错误示例

```bash
# ❌ 错误 - 会变成链接
openclaw message send --filePath /path/to/file.mp3 ...

# ✅ 正确 - 直接发送文件
openclaw message send --media ~/.openclaw/workspace/file.mp3 ...
```

## 应用场景

### 1. AI资讯语音播报

```python
import re

def convert_to_broadcast(text):
    """文字稿转口播文案"""
    text = re.sub(r'📰|📊|💡|🔗', '', text)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    broadcast = ["各位好，欢迎收听今天的AI资讯，我是子房。", ""]
    
    news_titles = []
    for line in lines:
        if re.match(r'^\d+\.', line):
            title = re.sub(r'^\d+\.\s*', '', line).strip()
            if title and 'http' not in title:
                news_titles.append(title)
    
    for i, title in enumerate(news_titles):
        broadcast.append(f"第{i+1}条，{title}。")
    
    broadcast.append("")
    broadcast.append(f"以上就是今天的{len(news_titles)}条AI资讯，感谢收听。")
    
    return "\n".join(broadcast)

# 使用
report = "📰 AI资讯 Daily\n1. AI助手成CES展会焦点\n2. 大模型价格战持续升级"
broadcast_text = convert_to_broadcast(report)
edge_tts(broadcast_text)
```

### 2. 有声书/文章朗读

```python
# 长文本处理
def text_to_audiobook(text_file, voice="zh-CN-YunyangNeural"):
    """将文本文件转换为语音"""
    with open(text_file, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # 分段处理（每段建议500字以内）
    chunks = [text[i:i+500] for i in range(0, len(text), 500)]
    
    for i, chunk in enumerate(chunks):
        output = f"chapter_{i+1}.mp3"
        edge_tts(chunk, voice, output)
        print(f"完成: {output}")

text_to_audiobook("article.txt")
```

### 3. 语音提醒

```python
def send_voice_reminder(message, target_user):
    """发送语音提醒"""
    broadcast = f"提醒：{message}"
    output = "/tmp/reminder.mp3"
    
    if edge_tts(broadcast, output=output):
        return send_voice_to_feishu(output, target_user)
    return False

send_voice_reminder("下午3点有会议", "ou_xxx")
```

## 常见问题

### Q: 语音生成失败怎么办？
A: 检查网络连接，或尝试更换语音ID

### Q: 文本太长怎么办？
A: 建议控制在500字以内，或分段生成后拼接

### Q: 发送到飞书变成链接怎么办？
A: 确保使用 `--media` 参数，且文件在 `~/.openclaw/workspace/` 目录

### Q: 如何选择适合的语音？
A: 
- 新闻播报 → YunyangNeural
- 儿童内容 → XiaoxiaoNeural
- 激情演讲 → YunjianNeural

## 当前配置

- **默认语音**: zh-CN-YunyangNeural
- **飞书目标**: ou_5fc272521ab2cf6a898a5a9194093719
- **状态**: ✅ 已验证可用

---
