#!/usr/bin/env python3
"""配色方案定义"""

from pptx.dml.color import RGBColor

# 主题配色
THEMES = {
    'blue-red': {
        'primary': RGBColor(0, 82, 147),      # 蓝 #005293
        'secondary': RGBColor(200, 16, 46),    # 红 #C8102E
        'white': RGBColor(255, 255, 255),
        'light_primary': RGBColor(240, 248, 255),  # 浅蓝
        'light_secondary': RGBColor(255, 240, 240), # 浅红
        'dark': RGBColor(40, 40, 40),
    },
    'blue-yellow': {
        'primary': RGBColor(0, 82, 147),       # 蓝
        'secondary': RGBColor(255, 192, 0),    # 黄
        'white': RGBColor(255, 255, 255),
        'light_primary': RGBColor(240, 248, 255),
        'light_secondary': RGBColor(255, 250, 240),
        'dark': RGBColor(40, 40, 40),
    },
    'red-gold': {
        'primary': RGBColor(200, 16, 46),     # 红
        'secondary': RGBColor(218, 165, 32),   # 金
        'white': RGBColor(255, 255, 255),
        'light_primary': RGBColor(255, 240, 240),
        'light_secondary': RGBColor(255, 248, 220),
        'dark': RGBColor(40, 40, 40),
    },
    'green-orange': {
        'primary': RGBColor(34, 139, 34),     # 绿
        'secondary': RGBColor(255, 140, 0),     # 橙
        'white': RGBColor(255, 255, 255),
        'light_primary': RGBColor(240, 255, 240),
        'light_secondary': RGBColor(255, 245, 238),
        'dark': RGBColor(40, 40, 40),
    },
    'purple-gold': {
        'primary': RGBColor(128, 0, 128),     # 紫
        'secondary': RGBColor(218, 165, 32),   # 金
        'white': RGBColor(255, 255, 255),
        'light_primary': RGBColor(245, 240, 255),
        'light_secondary': RGBColor(255, 248, 220),
        'dark': RGBColor(40, 40, 40),
    },
    'black-gold': {
        'primary': RGBColor(30, 30, 30),       # 黑
        'secondary': RGBColor(218, 165, 32),  # 金
        'white': RGBColor(255, 255, 255),
        'light_primary': RGBColor(60, 60, 60),
        'light_secondary': RGBColor(255, 248, 220),
        'dark': RGBColor(40, 40, 40),
    },
}

def get_theme_colors(theme='blue-red'):
    """获取主题配色"""
    return THEMES.get(theme, THEMES['blue-red'])

def list_themes():
    """列出所有可用主题"""
    return list(THEMES.keys())
