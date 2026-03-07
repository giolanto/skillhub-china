# 阿里云盘 API 技能

## 简介

提供阿里云盘文件操作能力，支持上传、下载、分享、转存等功能。

## 配置

### 获取 Token

1. 打开 https://www.aliyundrive.com/
2. 登录账号
3. F12 → Application → Local Storage → https://www.aliyundrive.com
4. 找到 `token` 项，复制值
5. 保存到 `config/aliyundrive.json`

## 功能

### 1. 文件列表
```python
from scripts.aliyundrive import AliyunDrive

client = AliyunDrive(config_path="config/aliyundrive.json")
files = client.list_files("/")
print(files)
```

### 2. 上传文件
```python
# 上传文件
client.upload_file("test.txt", "/闲鱼资源/")

# 上传文件夹
client.upload_folder("./my_folder", "/闲鱼资源/")
```

### 3. 创建分享链接
```python
share_info = client.create_share("文件ID", expire_days=7)
print(share_info['share_url'])
```

### 4. 转存文件
```python
# 转存分享的文件到自己的网盘
client.save_share("分享链接", "提取码", "/闲鱼资源/")
```

## API

- `list_files(path)` - 列出文件
- `upload_file(local_path, remote_path)` - 上传文件
- `upload_folder(local_folder, remote_path)` - 上传文件夹
- `create_share(file_id, expire_days)` - 创建分享
- `save_share(url, code, path)` - 转存文件
- `download_file(file_id, local_path)` - 下载文件

## 依赖

```
requests
```
