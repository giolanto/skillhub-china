# PPT智能生成器 v2 使用说明

## 快速开始

```bash
# 1. 进入目录
cd ~/.openclaw/skills/ppt-generator-v2

# 2. 安装依赖
pip install python-pptx pyyaml

# 3. 准备图片
mkdir -p images
# 把图片放入 images/ 目录

# 4. 修改配置
vim config.yaml

# 5. 生成PPT
python3 scripts/generate.py
```

## 命令行参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `-c, --config` | 配置文件 | `config.yaml` |
| `-t, --title` | PPT标题 | `--title "我的PPT"` |
| `-s, --subtitle` | 副标题 | `-s "副标题"` |
| `--theme` | 配色主题 | `--theme blue-red` |
| `-o, --output` | 输出文件 | `-o result.pptx` |

## 配色主题

```bash
# 蓝红撞色（默认）
python3 scripts/generate.py --theme blue-red

# 蓝黄撞色
python3 scripts/generate.py --theme blue-yellow

# 红金撞色
python3 scripts/generate.py --theme red-gold

# 绿橙撞色
python3 scripts/generate.py --theme green-orange

# 紫金撞色
python3 scripts/generate.py --theme purple-gold

# 黑金撞色
python3 scripts/generate.py --theme black-gold
```

## 自定义内容

修改 `config.yaml`：

```yaml
title: "你的标题"
subtitle: "你的副标题"

content:
  intro:
    - "特点1"
    - "特点2"
  
  features:
    - icon: "💡"
      title: "功能1"
      desc: "描述"
    # 添加更多...
```

## 图片要求

- 格式：JPEG（推荐）
- 尺寸：至少 1920x1080
- 放置目录：`images/`

## 输出

生成的PPT保存在当前目录，文件名由 `config.yaml` 中的 `output` 指定。
