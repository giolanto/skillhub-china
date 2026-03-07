#!/usr/bin/env python3
"""
阿里云盘 API
支持文件上传、下载、分享、转存等功能
"""

import os
import json
import requests
from typing import Optional, List, Dict, Any


class AliyunDrive:
    """阿里云盘 API 客户端"""
    
    API_BASE = "https://api.aliyundrive.com"
    
    def __init__(self, config_path: str = None, token: Dict = None):
        """
        初始化
        
        Args:
            config_path: 配置文件路径
            token: 直接传入token字典
        """
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                self.token = json.load(f)
        elif token:
            self.token = token
        else:
            raise ValueError("需要提供 config_path 或 token")
        
        self.access_token = self.token.get('access_token')
        self.refresh_token = self.token.get('refresh_token')
        self.drive_id = self.token.get('default_drive_id')
        
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
    
    def _request(self, method: str, url: str, **kwargs) -> Dict:
        """发送请求"""
        resp = requests.request(method, url, headers=self.headers, **kwargs)
        if resp.status_code >= 400:
            raise Exception(f"API错误: {resp.status_code} - {resp.text}")
        return resp.json() if resp.text else {}
    
    def list_files(self, path: str = "/", limit: int = 100) -> List[Dict]:
        """
        列出文件
        
        Args:
            path: 路径
            limit: 返回数量
        """
        parent_id = "root" if path == "/" else self._get_file_id(path)
        
        result = self._request("POST", f"{self.API_BASE}/adrive/v2/file/list", json={
            "drive_id": self.drive_id,
            "parent_file_id": parent_id,
            "limit": limit
        })
        return result.get('items', [])
    
    def _get_file_id(self, path: str) -> str:
        """根据路径获取文件ID"""
        # 简化实现：遍历查找
        parts = path.strip('/').split('/')
        parent_id = "root"
        
        for part in parts:
            files = self._request("POST", f"{self.API_BASE}/adrive/v2/file/list", json={
                "drive_id": self.drive_id,
                "parent_file_id": parent_id,
                "limit": 100
            })
            found = False
            for f in files.get('items', []):
                if f.get('name') == part:
                    parent_id = f.get('file_id')
                    found = True
                    break
            if not found:
                raise FileNotFoundError(f"路径不存在: {path}")
        
        return parent_id
    
    def upload_file(self, local_path: str, remote_path: str = "/") -> Dict:
        """
        上传文件
        
        Args:
            local_path: 本地文件路径
            remote_path: 远程目录路径
        """
        file_name = os.path.basename(local_path)
        
        # 获取父目录ID
        parent_id = "root" if remote_path == "/" else self._get_file_id(remote_path)
        
        with open(local_path, 'rb') as f:
            file_content = f.read()
        
        # 简单上传（小于100MB）
        import base64
        content_hash = base64.b64encode(file_content).decode()
        
        # 创建空白文件
        result = self._request("POST", f"{self.API_BASE}/adrive/v2/file/create", json={
            "drive_id": self.drive_id,
            "parent_file_id": parent_id,
            "name": file_name,
            "type": "file",
            "size": len(file_content),
            "content_hash": content_hash,
            "proof_version": "v1"
        })
        
        file_id = result.get('file_id')
        
        # 上传内容
        upload_url = result.get('upload_url')
        if upload_url:
            requests.put(upload_url, data=file_content)
        
        return result
    
    def create_share(self, file_id: str, expire_days: int = 7) -> Dict:
        """
        创建分享链接
        
        Args:
            file_id: 文件ID
            expire_days: 过期天数
        """
        from datetime import datetime, timedelta
        
        result = self._request("POST", f"{self.API_BASE}/adrive/v1/user/share/create", json={
            "drive_id": self.drive_id,
            "file_id_list": json.dumps([file_id]),
            "expiration": (datetime.now() + timedelta(days=expire_days)).isoformat() + "Z"
        })
        
        return {
            "share_url": f"https://www.aliyundrive.com/s/{result.get('share_id')}",
            "share_id": result.get('share_id'),
            "expire_days": expire_days
        }
    
    def save_share(self, share_url: str, code: str, path: str = "/") -> Dict:
        """
        转存分享的文件
        
        Args:
            share_url: 分享链接
            code: 提取码
            path: 保存路径
        """
        # 提取share_id
        share_id = share_url.split('/')[-1]
        
        # 获取分享文件信息
        share_info = self._request("POST", f"{self.API_BASE}/adrive/v2/share_link/get_share_link_by_anonymous", json={
            "share_id": share_id,
            "share_pwd": code
        })
        
        file_id = share_info.get('file_info', {}).get('file_id')
        
        # 转存
        parent_id = "root" if path == "/" else self._get_file_id(path)
        
        result = self._request("POST", f"{self.API_BASE}/adrive/v2/file/copy", json={
            "drive_id": self.drive_id,
            "file_id": file_id,
            "parent_file_id": parent_id,
            "new_name": share_info.get('file_info', {}).get('name')
        })
        
        return result
    
    def download_file(self, file_id: str, local_path: str) -> None:
        """
        下载文件
        
        Args:
            file_id: 文件ID
            local_path: 本地保存路径
        """
        # 获取下载链接
        result = self._request("POST", f"{self.API_BASE}/adrive/v2/file/get_download_url", json={
            "drive_id": self.drive_id,
            "file_id": file_id
        })
        
        download_url = result.get('url')
        if not download_url:
            raise Exception("无法获取下载链接")
        
        # 下载
        resp = requests.get(download_url, stream=True)
        with open(local_path, 'wb') as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)


def main():
    """命令行入口"""
    import argparse
    
    parser = argparse.ArgumentParser(description="阿里云盘 CLI")
    parser.add_argument("--config", default="config/aliyundrive.json", help="配置文件路径")
    parser.add_argument("command", choices=["list", "upload", "share", "save", "download"], help="命令")
    parser.add_argument("args", nargs="*", help="参数")
    
    args = parser.parse_args()
    
    client = AliyunDrive(config_path=args.config)
    
    if args.command == "list":
        path = args.args[0] if args.args else "/"
        files = client.list_files(path)
        for f in files:
            print(f"{f.get('type'):6} {f.get('size', 0):>10} {f.get('name')}")
    
    elif args.command == "upload":
        local = args.args[0]
        remote = args.args[1] if len(args.args) > 1 else "/"
        result = client.upload_file(local, remote)
        print(f"上传成功: {result.get('file_id')}")
    
    elif args.command == "share":
        file_id = args.args[0]
        result = client.create_share(file_id)
        print(f"分享链接: {result.get('share_url')}")
    
    elif args.command == "save":
        url, code = args.args[0], args.args[1]
        path = args.args[2] if len(args.args) > 2 else "/"
        result = client.save_share(url, code, path)
        print(f"转存成功: {result}")
    
    elif args.command == "download":
        file_id, local = args.args[0], args.args[1]
        client.download_file(file_id, local)
        print("下载成功")


if __name__ == "__main__":
    main()
