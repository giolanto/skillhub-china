#!/usr/bin/env python3
"""PPT智能生成器 v2 - 主脚本"""

import os
import sys
import argparse
import yaml
from pathlib import Path

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from templates import (
    create_cover_slide, create_toc_slide, create_intro_slide,
    create_features_slide, create_scenarios_slide, create_cases_slide,
    create_summary_slide, create_ending_slide
)
from themes import get_theme_colors

DEFAULT_CONFIG = """
# PPT生成器配置文件

output: "OpenClaw演示.pptx"

# 主题配色：blue-red, blue-yellow, red-gold, green-orange, purple-gold
theme: "blue-red"

# 标题配置
title: "演示标题"
subtitle: "副标题"

# 页面配置
pages:
  cover: true
  toc: true
  intro: true
  features: true
  scenarios: true
  cases: true
  summary: true
  ending: true

# 图片配置
images:
  dir: "images"
  cover: "tech.jpg"
  intro: "robot.jpg"
  features: "ai_assistant.jpg"
  scenarios: "office.jpg"
  ending: "tech.jpg"

# 内容配置
content:
  intro:
    - "特点1"
    - "特点2"
    - "特点3"
    - "特点4"

  features:
    - icon: "💡"
      title: "功能一"
      desc: "功能描述"
    - icon: "⚡"
      title: "功能二"
      desc: "功能描述"
    - icon: "🎯"
      title: "功能三"
      desc: "功能描述"
    - icon: "🚀"
      title: "功能四"
      desc: "功能描述"

  scenarios:
    - icon: "👤"
      title: "场景一"
      desc: "场景描述"
    - icon: "🎬"
      title: "场景二"
      desc: "场景描述"

  cases:
    - icon: "📌"
      title: "案例一"
      desc: "案例描述"

  summary:
    - "✅ 优点一"
    - "✅ 优点二"
"""

def load_config(config_path='config.yaml'):
    """加载配置文件"""
    if not os.path.exists(config_path):
        # 创建默认配置
        with open(config_path, 'w', encoding='utf-8') as f:
            f.write(DEFAULT_CONFIG)
        print(f"📝 已创建默认配置文件: {config_path}")
        print("   请修改配置后重新运行")
        sys.exit(1)
    
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def main():
    parser = argparse.ArgumentParser(description='PPT智能生成器 v2')
    parser.add_argument('--config', '-c', default='config.yaml', help='配置文件路径')
    parser.add_argument('--title', '-t', help='PPT标题（覆盖配置）')
    parser.add_argument('--subtitle', '-s', help='PPT副标题（覆盖配置）')
    parser.add_argument('--theme', help='配色主题')
    parser.add_argument('--output', '-o', help='输出文件名')
    args = parser.parse_args()
    
    # 加载配置
    config = load_config(args.config)
    
    # 命令行参数覆盖配置
    if args.title:
        config['title'] = args.title
    if args.subtitle:
        config['subtitle'] = args.subtitle
    if args.theme:
        config['theme'] = args.theme
    if args.output:
        config['output'] = args.output
    
    # 获取配色
    colors = get_theme_colors(config.get('theme', 'blue-red'))
    
    # 获取图片目录
    img_dir = config.get('images', {}).get('dir', 'images')
    
    print(f"🎨 主题: {config.get('theme', 'blue-red')}")
    print(f"📄 标题: {config.get('title', '演示')}")
    print(f"📁 图片目录: {img_dir}")
    print(f"💾 输出: {config.get('output', 'output.pptx')}")
    print()
    
    # 导入并运行
    from pptx import Presentation
    from pptx.util import Inches
    
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    pages = config.get('pages', {})
    content = config.get('content', {})
    images = config.get('images', {})
    
    # 生成页面
    if pages.get('cover', True):
        create_cover_slide(prs, config.get('title', '标题'), 
                         config.get('subtitle', ''), colors, img_dir, images.get('cover'))
    
    if pages.get('toc', True):
        create_toc_slide(prs, colors)
    
    if pages.get('intro', True):
        create_intro_slide(prs, content.get('intro', []), colors, img_dir, images.get('intro'))
    
    if pages.get('features', True):
        create_features_slide(prs, content.get('features', []), colors, img_dir, images.get('features'))
    
    if pages.get('scenarios', True):
        create_scenarios_slide(prs, content.get('scenarios', []), colors, img_dir, images.get('scenarios'))
    
    if pages.get('cases', True):
        create_cases_slide(prs, content.get('cases', []), colors)
    
    if pages.get('summary', True):
        create_summary_slide(prs, content.get('summary', []), colors)
    
    if pages.get('ending', True):
        create_ending_slide(prs, colors, img_dir, images.get('ending'))
    
    # 保存
    output_file = config.get('output', 'output.pptx')
    prs.save(output_file)
    
    size = os.path.getsize(output_file)
    print(f"✅ 生成完成: {output_file} ({size/1024:.1f}KB)")

if __name__ == '__main__':
    main()
