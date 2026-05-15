#!/bin/bash
# =============================================
# 养虾池Token加油站 - One-API 一键部署脚本
# 使用方式：ssh登录VPS后，复制粘贴运行
# =============================================

set -e

echo "🦐 养虾池 Token加油站 - One-API 部署脚本"
echo "=========================================="

# 变量设置（请根据实际情况修改）
DOMAIN="api.agent-skills.net.cn"
EMAIL="giolanto7744@126.com"
DATA_DIR="/opt/one-api"
PORT=3000

# 1. 检查系统环境
echo "[1/7] 检查系统环境..."
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    sudo apt update && sudo apt install -y docker.io docker-compose
    sudo systemctl enable --now docker
    echo "Docker 安装完成"
else
    echo "Docker 已安装 ✓"
fi

# 2. 创建数据目录
echo "[2/7] 创建数据目录..."
sudo mkdir -p $DATA_DIR
sudo chown -R $(whoami):$(whoami) $DATA_DIR

# 3. 拉取 One-API Docker 镜像
echo "[3/7] 拉取 One-API 镜像..."
docker pull justsong/one-api || docker pull ghcr.io/songquanpeng/one-api
echo "镜像拉取完成 ✓"

# 4. 停止并删除旧容器（如有）
echo "[4/7] 清理旧容器..."
docker stop one-api 2>/dev/null && docker rm one-api 2>/dev/null || true

# 5. 启动 One-API
echo "[5/7] 启动 One-API 容器..."
SESSION_SECRET=$(openssl rand -base64 32)
docker run -d \
    --name one-api \
    --restart always \
    -p $PORT:3000 \
    -e TZ=Asia/Shanghai \
    -e SESSION_SECRET="$SESSION_SECRET" \
    -v $DATA_DIR:/data \
    justsong/one-api

echo "One-API 启动成功 ✓"
echo "初始账号: root"
echo "初始密码: 123456  ← 首次登录后务必修改！"

# 6. 安装 Nginx
echo "[6/7] 配置 Nginx 反向代理..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi

sudo tee /etc/nginx/sites-available/one-api > /dev/null <<EOF
server {
    server_name $DOMAIN;

    client_max_body_size 64m;

    location / {
        proxy_http_version 1.1;
        proxy_pass http://localhost:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header Accept-Encoding gzip;
        proxy_read_timeout 300s;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/one-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
echo "Nginx 配置完成 ✓"

# 7. 申请 SSL 证书
echo "[7/7] 申请 Let's Encrypt SSL 证书..."
if ! command -v certbot &> /dev/null; then
    sudo snap install --classic certbot
    sudo ln -sf /snap/bin/certbot /usr/bin/certbot
fi

sudo certbot --nginx -d $DOMAIN --noninteractive --agree-tos -m $EMAIL
sudo systemctl reload nginx

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📌 重要信息："
echo "   管理后台: https://$DOMAIN"
echo "   初始账号: root"
echo "   初始密码: 123456  ← 登录后立即修改！"
echo ""
echo "📌 下一步操作："
echo "   1. 登录管理后台，修改root密码"
echo "   2. 在「渠道管理」中添加你的API Key（OpenAI/Claude等）"
echo "   3. 在「额度」中设置新用户初始额度"
echo "   4. 在「设置」中配置系统名称和Logo"
echo ""
echo "📌 更新 One-API 命令："
echo "   docker run --rm -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower -cR one-api"
echo ""
