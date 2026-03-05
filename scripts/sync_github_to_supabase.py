#!/usr/bin/env python3
"""
批量从GitHub下载技能仓库并上传到Supabase Storage
"""

import os
import subprocess
import requests
import zipfile
import io
import time
import sys

SUPABASE_URL = "https://fbqpbobsqwcgzbwyeisx.supabase.co"
SUPABASE_SERVICE_KEY = "YOUR_SERVICE_ROLE_KEY"
TEMP_DIR = "/tmp/skillhub_downloads"

def get_all_skills():
    SUPABASE_ANON_KEY = "sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe"
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/skills?select=id,name,github,download_url&github=not.is.null&download_url=is.null",
        headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {SUPABASE_ANON_KEY}"}
    )
    return response.json() if response.status_code == 200 else []

def download_github_repo(github_url, skill_id):
    repo_name = github_url.rstrip('/').split('/')[-1]
    temp_path = os.path.join(TEMP_DIR, f"{skill_id}_{repo_name}")
    if os.path.exists(temp_path):
        subprocess.run(["rm", "-rf", temp_path], check=True)
    try:
        for branch in ["main", "master"]:
            result = subprocess.run(["git", "clone", "--depth", "1", "--branch", branch, github_url, temp_path], 
                                  capture_output=True, text=True, timeout=120)
            if result.returncode == 0:
                subprocess.run(["rm", "-rf", os.path.join(temp_path, ".git")], check=True)
                return temp_path
    except:
        pass
    return None

def create_zip(temp_path, skill_name, skill_id):
    zip_buffer = io.BytesIO()
    repo_name = os.path.basename(temp_path)
    try:
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for root, dirs, files in os.walk(temp_path):
                dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules']]
                for file in files:
                    try:
                        zf.write(os.path.join(root, file), os.path.join(repo_name, os.path.relpath(os.path.join(root, file), temp_path)))
                    except:
                        pass
        zip_buffer.seek(0)
        return zip_buffer.getvalue()
    except:
        return None

def upload_to_supabase(zip_data, skill_name, skill_id):
    safe_name = "".join(c for c in skill_name if c.isalnum() or c in '-_')
    file_name = f"{skill_id}_{safe_name}.zip"
    try:
        response = requests.post(
            f"{SUPABASE_URL}/storage/v1/object/skills/{file_name}",
            headers={"Authorization": f"Bearer {SUPABASE_SERVICE_KEY}", "Content-Type": "application/zip", "x-upsert": "true"},
            data=zip_data, timeout=120
        )
        if response.status_code in [200, 201]:
            return f"{SUPABASE_URL}/storage/v1/object/public/skills/{file_name}"
    except:
        pass
    return None

def update_skill_download_url(skill_id, download_url):
    SUPABASE_ANON_KEY = "sb_publishable_M9D41SZe16gP0Qe_fPQeig_v09ffQVe"
    try:
        requests.patch(
            f"{SUPABASE_URL}/rest/v1/skills?id=eq.{skill_id}",
            headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {SUPABASE_ANON_KEY}", "Content-Type": "application/json"},
            json={"download_url": download_url}
        )
        return True
    except:
        return False

def main():
    os.makedirs(TEMP_DIR, exist_ok=True)
    if "YOUR_SERVICE" in SUPABASE_SERVICE_KEY:
        print("❌ 请先配置 SUPABASE_SERVICE_KEY！")
        sys.exit(1)
    skills = get_all_skills()
    print(f"找到 {len(skills)} 个技能需要处理")
    success = 0
    for skill in skills:
        print(f"处理: {skill['name']}")
        temp_path = download_github_repo(skill['github'], skill['id'])
        if not temp_path:
            continue
        zip_data = create_zip(temp_path, skill['name'], skill['id'])
        if not zip_data:
            continue
        url = upload_to_supabase(zip_data, skill['name'], skill['id'])
        if url and update_skill_download_url(skill['id'], url):
            success += 1
        time.sleep(1)
    print(f"完成! 成功 {success}/{len(skills)}")
    subprocess.run(["rm", "-rf", TEMP_DIR])

if __name__ == "__main__":
    main()
