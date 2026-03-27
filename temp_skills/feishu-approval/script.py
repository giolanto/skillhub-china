#!/usr/bin/env python3
"""飞书审批自动处理技能"""

import requests
import argparse

def approve(approval_id: str, comment: str, app_id: str, app_secret: str) -> dict:
    """通过审批"""
    # 获取tenant_access_token
    token_url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    token_data = {"app_id": app_id, "app_secret": app_secret}
    token_resp = requests.post(token_url, json=token_data).json()
    tenant_token = token_resp.get("tenant_access_token")
    
    # 审批通过
    url = "https://open.feishu.cn/open-api/approval/v4/instance/approve"
    headers = {"Authorization": f"Bearer {tenant_token}"}
    data = {"instance_id": approval_id, "comment": comment}
    response = requests.post(url, headers=headers, json=data)
    return response.json()

def reject(approval_id: str, comment: str, app_id: str, app_secret: str) -> dict:
    """拒绝审批"""
    # 获取tenant_access_token
    token_url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    token_data = {"app_id": app_id, "app_secret": app_secret}
    token_resp = requests.post(token_url, json=token_data).json()
    tenant_token = token_resp.get("tenant_access_token")
    
    # 审批拒绝
    url = "https://open.feishu.cn/open-api/approval/v4/instance/reject"
    headers = {"Authorization": f"Bearer {tenant_token}"}
    data = {"instance_id": approval_id, "comment": comment}
    response = requests.post(url, headers=headers, json=data)
    return response.json()

def list_approvals(app_id: str, app_secret: str) -> dict:
    """获取审批列表"""
    token_url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    token_data = {"app_id": app_id, "app_secret": app_secret}
    token_resp = requests.post(token_url, json=token_data).json()
    tenant_token = token_resp.get("tenant_access_token")
    
    url = "https://open.feishu.cn/open-api/approval/v4/instance/list"
    headers = {"Authorization": f"Bearer {tenant_token}"}
    response = requests.get(url, headers=headers)
    return response.json()

def main():
    parser = argparse.ArgumentParser(description="飞书审批自动处理")
    parser.add_argument("--action", required=True, help="操作: approve/reject/list")
    parser.add_argument("--approval-id", help="审批实例ID")
    parser.add_argument("--comment", default="同意", help="审批意见")
    parser.add_argument("--app-id", required=True, help="飞书应用App ID")
    parser.add_argument("--app-secret", required=True, help="飞书应用App Secret")
    
    args = parser.parse_args()
    
    if args.action == "approve":
        result = approve(args.approval_id, args.comment, args.app_id, args.app_secret)
    elif args.action == "reject":
        result = reject(args.approval_id, args.comment, args.app_id, args.app_secret)
    elif args.action == "list":
        result = list_approvals(args.app_id, args.app_secret)
    
    print(f"结果: {result}")

if __name__ == "__main__":
    main()