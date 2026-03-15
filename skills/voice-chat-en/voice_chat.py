#!/usr/bin/env python3
"""
语音对话系统 - 整合 Parakeet + AI + Edge TTS
使用云希声音 (zh-CN-YunxiNeural)

⚠️ 重要规则：凡是用语音输入，必须用语音回复！
"""

import os
import sys
import json
import argparse
import subprocess
import requests
import numpy as np
import wave
import edge_tts
import asyncio
from pathlib import Path

# ============ 配置 ============
DEFAULT_TTS_VOICE = "zh-CN-YunxiNeural"  # 云希 - 成熟男声

# ============ 音频处理 ============
def convert_audio(input_path, output_path):
    """转换音频格式为 WAV"""
    result = subprocess.run([
        "afconvert", input_path, output_path,
        "-f", "WAVE", "-d", "LEI16"
    ], capture_output=True)
    return result.returncode == 0

def load_audio(wav_path):
    """加载 WAV 音频文件"""
    with wave.open(wav_path, 'r') as wav:
        frames = wav.readframes(wav.getnframes())
        audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
    return audio

# ============ 语音识别 (Parakeet/faster-whisper) ============
def whisper_transcribe(audio_path, model_name="tiny"):
    """使用 Parakeet (faster-whisper) 进行语音转文字"""
    from faster_whisper import WhisperModel
    
    # 加载模型 (tiny/base/small/medium/large)
    model_size = model_name if model_name else "tiny"
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    
    # 识别
    segments, info = model.transcribe(audio_path, language="zh")
    
    # 合并识别结果
    text = "".join([seg.text for seg in segments])
    return text

# ============ 语音合成 ============
def edge_speak(text, output_path, voice=DEFAULT_TTS_VOICE):
    """使用 Edge TTS 生成语音"""
    async def main():
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_path)
    
    asyncio.run(main())
    return output_path

# ============ 主流程 ============
def voice_chat(audio_path, output_path="reply.mp3"):
    """
    语音对话主流程
    
    Args:
        audio_path: 输入语音文件路径
        output_path: 输出语音文件路径
    
    Returns:
        tuple: (识别文字, 生成的语音文件路径)
    """
    # 1. 转换音频
    temp_wav = "/tmp/voice_input.wav"
    if not convert_audio(audio_path, temp_wav):
        return "音频转换失败", None
    
    # 2. 语音识别
    print(f"🎤 识别中...")
    user_text = whisper_transcribe(temp_wav)
    print(f"📝 识别结果: {user_text}")
    
    if not user_text.strip():
        return "未能识别语音内容", None
    
    # 3. AI 对话 (需要接入实际的 AI 接口)
    ai_response = f"收到你的消息：{user_text}。我会尽快回复你！"
    
    # 4. 语音合成
    print(f"🔊 生成语音中...")
    edge_speak(ai_response, output_path)
    print(f"✅ 语音已生成: {output_path}")
    
    return user_text, output_path

# ============ 命令行入口 ============
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="语音对话系统")
    parser.add_argument("--input", "-i", required=True, help="输入音频文件")
    parser.add_argument("--output", "-o", default="reply.mp3", help="输出语音文件")
    
    args = parser.parse_args()
    
    text, audio = voice_chat(args.input, args.output)
    
    print(f"\n========== 结果 ==========")
    print(f"识别文字: {text}")
    print(f"语音文件: {audio}")
    print(f"================================")
