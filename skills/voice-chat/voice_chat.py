#!/usr/bin/env python3
"""
语音对话系统 - 整合 Whisper + AI + TTS
支持飞书语音消息自动处理
"""

import os
import sys
import json
import argparse
import subprocess
import requests
from pathlib import Path

# ============ 配置 ============
# 飞书配置
FEISHU_APP_ID = os.getenv("FEISHU_APP_ID", "cli_xxxxx")
FEISHU_APP_SECRET = os.getenv("FEISHU_APP_SECRET", "xxxxx")
FEISHU_USER_ID = "ou_5fc272521ab2cf6a898a5a9194093719"

# 语音配置
DEFAULT_TTS_VOICE = "zh-CN-XiaoxiaoNeural"  # Edge TTS 默认音色
XFYUN_TTS_VOICE = "xiaoyan"  # 讯飞TTS 默认音色

# ============ 飞书 API ============
def get_feishu_access_token():
    """获取飞书应用 access_token"""
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    data = {"app_id": FEISHU_APP_ID, "app_secret": FEISHU_APP_SECRET}
    resp = requests.post(url, json=data).json()
    return resp.get("tenant_access_token")

def download_feishu_audio(file_id, save_path):
    """下载飞书语音文件"""
    token = get_feishu_access_token()
    
    # 获取文件下载地址
    url = f"https://open.feishu.cn/open-apis/drive/v1/files/{file_id}/download_url"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(url, headers=headers).json()
    
    if resp.get("code") != 0:
        print(f"获取下载链接失败: {resp}")
        return None
    
    download_url = resp["data"]["download_url"]
    
    # 下载文件
    audio_data = requests.get(download_url, headers=headers).content
    with open(save_path, "wb") as f:
        f.write(audio_data)
    
    return save_path

# ============ 语音识别 ============
def whisper_transcribe(audio_path, model="base", language="zh"):
    """使用 Whisper 进行语音转文字"""
    try:
        # 尝试使用 whisper CLI
        cmd = ["whisper", audio_path, "--language", language, "--model", model, "--output_format", "txt"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            txt_path = audio_path.replace(".mp3", ".txt").replace(".m4a", ".txt").replace(".wav", ".txt")
            if os.path.exists(txt_path):
                with open(txt_path, "r", encoding="utf-8") as f:
                    return f.read().strip()
        
        # 如果 CLI 失败，尝试用 openai-whisper Python 库
        try:
            import whisper
            model = whisper.load_model(model)
            result = model.transcribe(audio_path, language=language)
            return result["text"].strip()
        except:
            pass
        
        return f"语音识别失败: {result.stderr}"
    except Exception as e:
        return f"语音识别出错: {str(e)}"

# ============ 语音合成 ============
def edge_tts_speak(text, output_path, voice=DEFAULT_TTS_VOICE):
    """使用 Edge TTS 语音合成"""
    try:
        # 使用 edge-tts 库
        import edge_tts
        import asyncio
        
        async def main():
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(output_path)
        
        asyncio.run(main())
        return output_path
    except Exception as e:
        return None

def xfyun_tts_speak(text, output_path, voice=XFYUN_TTS_VOICE):
    """使用讯飞TTS语音合成"""
    try:
        # 讯飞TTS配置
        APPID = "bc589a3a"
        APISECRET = "N2U1ZTc1Mzg5ZTNjMjVkYzk2ZGQzNjg3"
        APIKEY = "23b7288cd0470730d9b888465e88f427"
        
        import hmac
        import hashlib
        import base64
        import time
        from urllib.parse import urlencode
        from wsgiref.handlers import format_date_time
        from time import mktime
        import datetime
        
        # 构建鉴权URL
        now = datetime.datetime.now()
        date = format_date_time(mktime(now.timetuple()))
        
        params = {"app": APPID, "cpid": FEISHU_USER_ID, "ctt": text, "pitch": "0", "rate": "16000", "speed": "50", "tts_auth_task": "online", "voice": voice}
        par_str = urlencode(params)
        
        # 签名
        signature_origin = f"host: tts-api.xfyun.cn\ndate: {date}\nGET /v2/tts HTTP/1.1\n{par_str}"
        signature_sha = hmac.new(APISECRET.encode('utf-8'), signature_origin.encode('utf-8'), digestmod=hashlib.sha256).digest()
        authorization_origin = f"api_key=\"{APIKEY}\", algorithm=\"hmac-sha256\", headers=\"host date request-line\", signature=\"{base64.b64encode(signature_sha).decode('utf-8')}\""
        authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode('utf-8')
        
        url = f"https://tts-api.xfyun.cn/v2/tts?{par_str}"
        headers = {
            "authorization": authorization,
            "date": date,
            "host": "tts-api.xfyun.cn"
        }
        
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            with open(output_path, "wb") as f:
                f.write(response.content)
            return output_path
        
        return None
    except Exception as e:
        return None

# ============ 主流程 ============
def voice_chat(audio_path=None, text=None, output_audio=None):
    """
    语音对话主流程
    """
    result_text = ""
    audio_file = output_audio
    
    # 1. 语音转文字
    if audio_path and os.path.exists(audio_path):
        print(f"🎤 识别语音: {audio_path}")
        user_text = whisper_transcribe(audio_path)
        print(f"📝 识别结果: {user_text}")
        result_text += f"你说: {user_text}\n"
    elif text:
        user_text = text
        result_text += f"你说: {text}\n"
    else:
        return "请提供语音文件或文字"
    
    # 2. AI 对话 (这里应该调用子房的对话能力)
    # TODO: 调用实际的 AI 对话接口
    ai_response = f"收到你的消息: {user_text}。我会尽快回复你！"
    result_text += f"子房回复: {ai_response}\n"
    
    # 3. 文字转语音
    if output_audio:
        # 优先使用 Edge TTS
        if edge_tts_speak(ai_response, output_audio):
            print(f"🔊 语音已生成: {output_audio}")
            audio_file = output_audio
        elif xfyun_tts_speak(ai_response, output_audio):
            print(f"🔊 讯飞语音已生成: {output_audio}")
            audio_file = output_audio
        else:
            print("⚠️ 语音合成失败")
    
    return result_text, audio_file

# ============ 命令行入口 ============
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="语音对话系统")
    parser.add_argument("--audio", "-a", help="输入音频文件")
    parser.add_argument("--text", "-t", help="输入文字(替代音频)")
    parser.add_argument("--output", "-o", default="reply.mp3", help="输出语音文件")
    parser.add_argument("--voice", "-v", default=DEFAULT_TTS_VOICE, help="TTS音色")
    
    args = parser.parse_args()
    
    result, audio = voice_chat(
        audio_path=args.audio,
        text=args.text,
        output_audio=args.output
    )
    
    print(result)
    if audio:
        print(f"\n✅ 语音回复: {audio}")
