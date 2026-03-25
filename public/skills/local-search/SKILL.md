# 私有搜索部署

## 功能描述
一键部署本地 SearXNG 元搜索引擎，实现隐私保护、无付费的搜索能力。部署后可在任何 Agent 中调用本地搜索服务。

## 核心特性
- 🔒 **隐私保护**：搜索数据完全本地化，不经第三方
- 🆓 **免费开源**：无需付费 API key
- 🌐 **聚合搜索**：整合 Google、Bing、DuckDuckGo 等 20+ 搜索引擎
- ⚡ **快速响应**：分布式搜索架构
- 🔧 **高度定制**：可配置引擎、过滤规则

## 前置要求
- Docker Desktop 已启动
- 端口 8082 可用

---

## 第一部分：部署

### 1. 创建项目目录
```bash
mkdir -p ~/docker/searxng/searxng/local
```

### 2. 创建 docker-compose.yaml
```yaml
# ~/docker/searxng/docker-compose.yaml
name: searxng

services:
  searxng:
    container_name: searxng
    image: searxng/searxng:latest
    ports:
      - "8082:8080"
    volumes:
      - ./searxng/local:/etc/searxng/local
    environment:
      - SEARXNG_BASE_URL=http://localhost:8082
      - SEARXNG_SECRET=your-secret-key-change-in-production
    restart: unless-stopped
```

### 3. 创建简化配置
```yaml
# ~/docker/searxng/searxng/local/settings.yml
search:
  safe_search: 0
  autocomplete: ""
  default_lang: zh-CN

server:
  secret_key: "changeme"
  bind_address: "0.0.0.0"
  port: 8080

engines:
  - name: duckduckgo
    engine: duckduckgo
    shortcut: ddg
  - name: google
    engine: google
    shortcut: gp
  - name: bing
    engine: bing
    shortcut: bi
```

### 4. 启动服务
```bash
cd ~/docker/searxng
docker compose up -d
```

### 5. 验证
```bash
curl http://localhost:8082
```

---

## 第二部分：使用

### 1. Python 调用
```python
import requests

def local_search(query, limit=10):
    """使用本地 SearXNG 搜索"""
    url = "http://localhost:8082/search"
    params = {"q": query, "format": "json", "num": limit}
    resp = requests.get(url, params=params)
    if resp.status_code == 200:
        return resp.json()
    return {"error": f"搜索失败: {resp.status_code}"}

# 使用示例
results = local_search("人工智能")
for r in results.get("results", []):
    print(f"{r.get('title')}: {r.get('url')}")
```

### 2. 命令行
```bash
# JSON 格式
curl "http://localhost:8082/search?q=关键词&format=json"

# 指定语言
curl "http://localhost:8082/search?q=关键词&lang=zh"
```

---

## 端口
| 服务 | 端口 |
|------|------|
| SearXNG | 8082 |

---

## 注意事项
- Firecrawl 需要 Docker-in-Docker，当前环境不支持
- 可用 Jina Reader 作为替代抓取方案
