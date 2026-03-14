#!/usr/bin/env python3
"""
Edge TTS - 微软文字转语音工具
用法: python3 edge_tts.py -t "文本" [-v 语音] [-o 输出文件]
"""
import argparse
import subprocess
import os
import shutil

# 默认配置
DEFAULT_VOICE = "zh-CN-YunyangNeural"
DEFAULT_OUTPUT = "output.mp3"

def list_voices():
    """列出所有可用语音"""
    subprocess.run(["python3", "-m", "edge_tts", "-l"])

def generate_speech(text, voice=DEFAULT_VOICE, output=DEFAULT_OUTPUT):
    """生成语音文件"""
    if not text:
        print("错误: 文本不能为空")
        return False
    
    cmd = [
        "python3", "-m", "edge_tts",
        "-t", text,
        "-v", voice,
        "--write-media", output
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0 and os.path.exists(output):
        size = os.path.getsize(output)
        print(f"✅ 语音生成成功: {output} ({size/1024:.1f} KB)")
        return True
    else:
        print(f"❌ 语音生成失败: {result.stderr}")
        return False

def send_to_feishu(audio_path, target="ou_5fc272521ab2cf6a898a5a9194093719"):
    """发送语音到飞书"""
    if not os.path.exists(audio_path):
        print(f"❌ 文件不存在: {audio_path}")
        return False
    
    # 复制到workspace
    dest = os.path.join(os.path.expanduser("~/.openclaw/workspace"), os.path.basename(audio_path))
    shutil.copy2(audio_path, dest)
    
    # 发送命令
    openclaw = os.path.expanduser("~/.local/node/22/bin/openclaw")
    if not os.path.exists(openclaw):
        openclaw = "openclaw"
    
    cmd = [
        openclaw, "message", "send",
        "--channel", "feishu",
        "--target", target,
        "--media", dest
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"✅ 语音已发送到飞书")
        return True
    else:
        print(f"❌ 发送失败: {result.stderr}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Edge TTS 文字转语音工具")
    parser.add_argument("-t", "--text", help="要转换的文本")
    parser.add_argument("-f", "--file", help="要转换的文本文件")
    parser.add_argument("-v", "--voice", default=DEFAULT_VOICE, help=f"语音ID (默认: {DEFAULT_VOICE})")
    parser.add_argument("-o", "--output", default=DEFAULT_OUTPUT, help=f"输出文件 (默认: {DEFAULT_OUTPUT})")
    parser.add_argument("-l", "--list", action="store_true", help="列出所有可用语音")
    parser.add_argument("--send", action="store_true", help="生成后发送到飞书")
    
    args = parser.parse_args()
    
    if args.list:
        list_voices()
        return
    
    # 获取文本
    text = args.text
    if args.file:
        if os.path.exists(args.file):
            with open(args.file, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            print(f"❌ 文件不存在: {args.file}")
            return
    
    if not text:
        print("请输入文本 (-t) 或文本文件 (-f)")
        return
    
    # 生成语音
    if generate_speech(text, args.voice, args.output):
        if args.send:
            send_to_feishu(args.output)

if __name__ == "__main__":
    main()
