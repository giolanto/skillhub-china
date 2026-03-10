# PPT智能生成器 v2

_基于python-pptx的PPT生成技能，支持图片嵌入、多种配色方案_

## 功能

- 📊 16:9比例标准PPT生成
- 🎨 多种配色方案（蓝红撞色、蓝黄撞色、红金、绿橙、紫金）
- 🖼️ 支持图片嵌入（图层顺序自动处理）
- 📝 多种布局模板（封面、目录、内容页、卡片页、结束页）
- ⚙️ 可配置标题、描述、图片路径

## 使用方法

```bash
# 生成默认蓝红撞色PPT
python3 scripts/generate.py

# 指定主题
python3 scripts/generate.py --title "我的PPT" --theme blue-red

# 指定自定义图片
python3 scripts/generate.py --bg-image my_bg.jpg
```

## 配置项

在 `config.yaml` 中修改：

```yaml
output: "output.pptx"
theme: "blue-red"  # blue-red, blue-yellow, red-gold, green-orange, purple-gold
title: "演示标题"
subtitle: "副标题"

images:
  dir: "images"
  cover: "tech.jpg"
  card: "ai.jpg"
```

## 配色方案

| 主题 | 主色 | 辅色 | 风格 |
|------|------|------|------|
| blue-red | 蓝#005293 | 红#C8102E | 商务 |
| blue-yellow | 蓝#005293 | 黄#FFC000 | 科技 |
| red-gold | 红#C8102E | 金#DAA520 | 高端 |
| green-orange | 绿#228B22 | 橙#FF8C00 | 活力 |
| purple-gold | 紫#800080 | 金#DAA520 | 尊贵 |

## 文件结构

```
ppt-generator-v2/
├── SKILL.md           # 本文件
├── config.yaml        # 配置文件
├── scripts/
│   ├── __init__.py
│   ├── generate.py    # 主脚本
│   ├── templates.py   # 页面模板
│   └── themes.py      # 配色方案
├── docs/
│   ├── README.md      # 使用说明
│   └── FAQ.md         # 常见问题
└── examples/
    └── demo.py        # 示例代码
```

## 依赖

```bash
pip install python-pptx pyyaml
```

## 注意事项

1. **图片格式**：使用JPEG格式，兼容性最好
2. **图片路径**：放在 `images/` 目录下
3. **图层顺序**：图片会自动放在最上层
4. **WPS兼容**：生成后用WPS打开测试
