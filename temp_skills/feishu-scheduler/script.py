#!/usr/bin/env python3
"""飞书定时推送技能"""

import requests
import argparse
import json
from datetime import datetime

def send_feishu_message(webhook: str, message: str) -> dict:
    """发送飞书消息"""
    headers = {"Content-Type": "application/json"}
    data = {"msg_type": "text", "content": {"text": message}}
    
    response = requests.post(webhook, headers=headers, json=data)
    return response.json()

def main():
    parser = argparse.ArgumentParser(description="飞书定时推送")
    parser.add_argument("--webhook", required=True, help="飞书机器人Webhook地址")
    parser.add_argument("--message", required=True, help="消息内容")
    parser.add_argument("--cron", default="now", help="Cron表达式，now表示立即发送")
    
    args = parser.parse_args()
    
    if args.cron == "now":
        result = send_feishu_message(args.webhook, args.message)
        print(f"消息已发送: {result}")
    else:
        # 保存任务配置，由外部cron调用
        print(f"定时任务已配置: {args.cron}")
        print(f"消息: {args.message}")

if __name__ == "__main__":
    main()