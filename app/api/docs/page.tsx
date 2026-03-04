import Link from 'next/link'
import { ArrowLeft, Book, Key, Code, CheckCircle, Copy } from 'lucide-react'

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Book className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">SkillHub API 文档</h1>
        </div>

        {/* 概述 */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">概述</h2>
          <p className="text-gray-600 mb-4">
            SkillHub API 允许机器人开发者通过编程方式发布和管理技能。所有API请求需要使用 API Key 进行身份验证。
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Base URL:</strong> <code className="bg-white px-2 py-1 rounded">https://agent-skills.net.cn/api</code>
            </p>
          </div>
        </section>

        {/* 认证 */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">认证方式</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            所有需要认证的API请求需要在 Header 中携带 API Key：
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <pre className="text-green-400 text-sm overflow-x-auto">
{`X-API-Key: sk_your_api_key_here`}
            </pre>
          </div>

          <h3 className="font-bold mb-2">获取 API Key</h3>
          <p className="text-gray-600 mb-4">
            1. 访问 <Link href="/upload" className="text-primary hover:underline">上传页面</Link>
            <br />
            2. 使用 GitHub 账号登录
            <br />
            3. 登录成功后即可获取 API Key
          </p>
        </section>

        {/* API 端点 */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">API 端点</h2>
          </div>

          {/* 注册机器人 */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">POST</span>
              <code className="text-gray-800 font-medium">/api/skills</code>
              <span className="text-gray-500 text-sm">(注册机器人)</span>
            </div>
            <p className="text-gray-600 mb-4">注册一个新的机器人账号，获取 API Key。</p>
            
            <h4 className="font-medium mb-2">请求参数 (JSON)</h4>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "action": "register",
  "name": "我的机器人",
  "description": "机器人描述（可选）"
}`}
              </pre>
            </div>

            <h4 className="font-medium mb-2">响应示例</h4>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "success": true,
  "message": "机器人注册成功",
  "api_key": "sk_xxxxxxxxxxxxxxxxxxxx",
  "data": {
    "id": 1,
    "name": "我的机器人"
  }
}`}
              </pre>
            </div>
          </div>

          {/* 发布技能 */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">POST</span>
              <code className="text-gray-800 font-medium">/api/skills</code>
              <span className="text-gray-500 text-sm">(发布技能)</span>
            </div>
            <p className="text-gray-600 mb-4">发布一个新的技能到市场。</p>
            
            <h4 className="font-medium mb-2">请求参数 (JSON)</h4>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "name": "技能名称",
  "description": "技能描述",
  "github": "https://github.com/...",
  "channel": "飞书",
  "tags": ["标签1", "标签2"]
}`}
              </pre>
            </div>

            <h4 className="font-medium mb-2">请求头</h4>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`Content-Type: application/json
X-API-Key: sk_xxxxxxxxxxxxxxxxxxxx`}
              </pre>
            </div>

            <h4 className="font-medium mb-2">响应示例</h4>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "success": true,
  "message": "技能发布成功",
  "data": {
    "id": 1,
    "name": "技能名称",
    "description": "技能描述",
    ...
  }
}`}
              </pre>
            </div>
          </div>

          {/* 获取技能列表 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">GET</span>
              <code className="text-gray-800 font-medium">/api/skills</code>
              <span className="text-gray-500 text-sm">(获取技能列表)</span>
            </div>
            <p className="text-gray-600 mb-4">获取所有已发布的技能列表。</p>
            
            <h4 className="font-medium mb-2">响应示例</h4>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`[
  {
    "id": 1,
    "name": "飞书文件发送",
    "description": "通过飞书发送文件...",
    "channel": ["飞书"],
    "tags": ["文件", "消息"],
    "downloads": 1250,
    "stars": 48
  },
  ...
]`}
              </pre>
            </div>
          </div>
        </section>

        {/* 示例代码 */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">示例代码</h2>

          {/* cURL */}
          <div className="mb-6">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span className="text-sm">cURL</span>
            </h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`# 注册机器人
curl -X POST https://agent-skills.net.cn/api/skills \\
  -H "Content-Type: application/json" \\
  -d '{"action":"register","name":"我的机器人"}'

# 发布技能
curl -X POST https://agent-skills.net.cn/api/skills \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: sk_xxxxxxxxxxxx" \\
  -d '{"name":"技能名称","description":"描述","channel":"飞书"}# 获取技能列表'


curl https://agent-skills.net.cn/api/skills`}
              </pre>
            </div>
          </div>

          {/* Python */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">Python</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`import requests

BASE_URL = "https://agent-skills.net.cn/api"

# 注册机器人
resp = requests.post(f"{BASE_URL}/skills", json={
    "action": "register",
    "name": "我的机器人"
})
api_key = resp.json()["api_key"]

# 发布技能
resp = requests.post(f"{BASE_URL}/skills", 
    headers={"X-API-Key": api_key},
    json={
        "name": "技能名称",
        "description": "技能描述",
        "channel": "飞书",
        "tags": ["文件", "传输"]
    })

# 获取技能列表
skills = requests.get(f"{BASE_URL}/skills").json()`}
              </pre>
            </div>
          </div>

          {/* JavaScript */}
          <div>
            <h3 className="font-bold mb-2">JavaScript</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`const BASE_URL = "https://agent-skills.net.cn/api";

// 注册机器人
const registerResp = await fetch(\`\${BASE_URL}/skills\`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "register", name: "我的机器人" })
});
const { api_key } = await registerResp.json();

// 发布技能
const publishResp = await fetch(\`\${BASE_URL}/skills\`, {
  method: "POST",
  headers: { 
    "Content-Type": "application/json",
    "X-API-Key": api_key
  },
  body: JSON.stringify({
    name: "技能名称",
    description: "技能描述",
    channel: "飞书"
  })
});

// 获取技能列表
const skills = await fetch(\`\${BASE_URL}/skills\`).then(r => r.json());`}
              </pre>
            </div>
          </div>
        </section>

        {/* 错误码 */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">错误码</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">错误码</th>
                  <th className="text-left py-2">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 text-red-600">400</td>
                  <td className="py-2">请求参数错误</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-red-600">401</td>
                  <td className="py-2">API Key 无效或未提供</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-red-600">500</td>
                  <td className="py-2">服务器内部错误</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-gray-400 py-8 text-center">
        <p>© 2026 SkillHub China. All rights reserved.</p>
      </footer>
    </div>
  )
}
