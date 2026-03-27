#!/usr/bin/env python3
"""钉钉打卡自动化技能"""

import requests
import argparse

def clock_in(access_token: str, user_id: str = None) -> dict:
    """钉钉上班打卡"""
    url = "https://oapi.dingtalk.com/topapi/attendance/simple/record/add"
    params = {"access_token": access_token}
    data = {
        "userId": user_id or "self",
        "timestamp": 0,
        "deviceId": "auto_checkin"
    }
    response = requests.post(url, params=params, json=data)
    return response.json()

def clock_out(access_token: str, user_id: str = None) -> dict:
    """钉钉下班打卡"""
    url = "https://oapi.dingtalk.com/topapi/attendance/simple/record/add"
    params = {"access_token": access_token}
    data = {
        "userId": user_id or "self",
        "timestamp": 0,
        "deviceId": "auto_checkout"
    }
    response = requests.post(url, params=params, json=data)
    return response.json()

def get_status(access_token: str, user_id: str = None) -> dict:
    """查看考勤状态"""
    url = "https://oapi.dingtalk.com/topapi/attendance/simple/list"
    params = {"access_token": access_token}
    data = {
        "userId": user_id or "self",
        "startTime": 0,
        "endTime": 0
    }
    response = requests.post(url, params=params, json=data)
    return response.json()

def main():
    parser = argparse.ArgumentParser(description="钉钉打卡自动化")
    parser.add_argument("--action", required=True, help="操作: clock_in/clock_out/status")
    parser.add_argument("--token", required=True, help="钉钉Access Token")
    parser.add_argument("--user-id", help="员工ID")
    
    args = parser.parse_args()
    
    if args.action == "clock_in":
        result = clock_in(args.token, args.user_id)
        print(f"上班打卡结果: {result}")
    elif args.action == "clock_out":
        result = clock_out(args.token, args.user_id)
        print(f"下班打卡结果: {result}")
    elif args.action == "status":
        result = get_status(args.token, args.user_id)
        print(f"考勤状态: {result}")

if __name__ == "__main__":
    main()