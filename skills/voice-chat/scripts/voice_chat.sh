#!/bin/bash
# 语音对话封装脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAIN_SCRIPT="$SCRIPT_DIR/../voice_chat.py"

# 运行语音对话
python3 "$MAIN_SCRIPT" "$@"
