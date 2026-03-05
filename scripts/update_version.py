#!/usr/bin/env python3
"""
项目文档版本更新脚本
用法: python3 scripts/update_version.py [版本号] [更新说明]
"""

import sys
import os
from datetime import datetime

DOCS_DIR = os.path.dirname(os.path.abspath(__file__)) + '/docs'
CHANGELOG = DOCS_DIR + '/CHANGELOG.md'
README = DOCS_DIR + '/README.md'

def get_current_version():
    """获取当前版本号"""
    try:
        with open(README, 'r') as f:
            for line in f:
                if line**:'):
                    return line.split(':.startswith('**版本')[1].strip()
    except:
        pass
    return "0.0.0"

def update_readme(version):
    """更新 README 中的版本号"""
    with open(README, 'r') as f:
        content = f.read()
    
    content = content.replace(
        '**版本**: v1.0.0',
        f'**版本**: v{version}'
    )
    content = content.replace(
        '**更新日期**: 2026-03-05',
        f'**更新日期**: {datetime.now().strftime("%Y-%m-%d")}'
    )
    
    with open(README, 'w') as f:
        f.write(content)
    
    print(f"✅ README.md 更新为 v{version}")

def add_changelog(version, changes):
    """添加更新日志"""
    today = datetime.now().strftime("%Y-%m-%d")
    
    new_entry = f"""## [{version}] - {today}

### Added
{changes}

"""
    
    with open(CHANGELOG, 'r') as f:
        content = f.read()
    
    # 在 [1.0.0] 之前插入新版本
    insert_pos = content.find('## [1.0.0]')
    if insert_pos == -1:
        content = new_entry + content
    else:
        content = content[:insert_pos] + new_entry + content[insert_pos:]
    
    with open(CHANGELOG, 'w') as f:
        f.write(content)
    
    print(f"✅ CHANGELOG.md 添加 v{version}")

def main():
    if len(sys.argv) < 2:
        print("用法: python3 update_version.py <版本号> <更新说明>")
        print("例如: python3 update_version.py 1.1.0 '新增技能搜索功能'")
        sys.exit(1)
    
    version = sys.argv[1]
    changes = sys.argv[2] if len(sys.argv) > 2 else "详见提交记录"
    
    print(f"📝 更新版本为 v{version}...")
    
    update_readme(version)
    add_changelog(version, f"- {changes}")
    
    print(f"\n✨ 版本 v{version} 更新完成！")

if __name__ == '__main__':
    main()
