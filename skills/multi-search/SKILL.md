# 多引擎联合搜索

## 简介

集成 **17个中外搜索引擎** 的超级搜索技能，无需任何API Key配置，下载即可使用。

这是 AI Agent 的网络搜索利器，一个命令同时覆盖百度、Google、Brave、DuckDuckGo 等主流搜索引擎。

## 支持的搜索引擎

### 🇨🇳 国内引擎 (8个)
| 引擎 | 特点 |
|------|------|
| 百度 | 中文搜索首选 |
| Bing CN | 微软中文搜索 |
| 360 | 安全搜索 |
| 搜狗 | 微信文章搜索 |
| 微信 | 公众号内容搜索 |
| 头条 | 资讯搜索 |
| 雪球 | 财经内容搜索 |

### 🌍 国际引擎 (9个)
| 引擎 | 特点 |
|------|------|
| Google | 全球最大 |
| Google HK | 香港节点 |
| Brave | 独立索引，隐私友好 |
| DuckDuckGo | 零追踪隐私搜索 |
| Yahoo | 老牌搜索 |
| Startpage | Google + 隐私 |
| Ecosia | 环保搜索 |
| Qwant | 欧盟合规 |
| WolframAlpha | 知识计算 |

## 快速开始

### 基础搜索

```javascript
// 使用 Brave 搜索（推荐）
web_fetch({"url": "https://search.brave.com/search?q=Python教程"})

// 使用百度搜索
web_fetch({"url": "https://www.baidu.com/s?wd=Python教程"})

// 使用 Google
web_fetch({"url": "https://www.google.com/search?q=Python教程"})
```

### 高级搜索语法

| 语法 | 示例 | 说明 |
|------|------|------|
| `site:` | `site:github.com python` | 站内搜索 |
| `filetype:` | `filetype:pdf report` | 指定文件类型 |
| `""` | `"机器学习"` | 精确匹配 |
| `-` | `python -snake` | 排除词 |
| `OR` | `cat OR dog` | 或运算 |

### 时间筛选

```javascript
// 最近一周
web_fetch({"url": "https://www.google.com/search?q=AI新闻&tbs=qdr:w"})

// 最近一个月
web_fetch({"url": "https://www.google.com/search?q=AI新闻&tbs=qdr:m"})

// 最近一年
web_fetch({"url": "https://www.google.com/search?q=AI新闻&tbs=qdr:y"})
```

### 隐私搜索

```javascript
// DuckDuckGo（零追踪）
web_fetch({"url": "https://duckduckgo.com/html/?q=隐私工具"})

// Startpage（Google + 隐私）
web_fetch({"url": "https://www.startpage.com/sp/search?query=隐私工具"})
```

### 实用快捷

```javascript
// DuckDuckGo Bangs
web_fetch({"url": "https://duckduckgo.com/html/?q=!gh+tensorflow"})  // GitHub
web_fetch({"url": "https://duckduckgo.com/html/?q=!so+python"})      // Stack Overflow
web_fetch({"url": "https://duckduckgo.com/html/?q=!w+AI"})           // Wikipedia

// WolframAlpha 知识计算
web_fetch({"url": "https://www.wolframalpha.com/input?i=100+USD+to+CNY"})
web_fetch({"url": "https://www.wolframalpha.com/input?i=integrate+x^2+dx"})
web_fetch({"url": "https://www.wolframalpha.com/input?i=weather+Beijing"})
```

## 核心优势

✅ **无需配置** - 下载即用，不需任何API Key  
✅ **多引擎覆盖** - 17个引擎，一个命令搞定  
✅ **中文友好** - 百度、搜狗、微信全覆盖  
✅ **隐私保护** - DuckDuckGo、Startpage 可隐身  
✅ **知识计算** - WolframAlpha 搞定数学换算  

## 适用场景

- 📚 **技术文档** - 搜GitHub、Stack Overflow
- 🔍 **市场调研** - 多引擎对比结果
- 📰 **热点追踪** - 百度头条最新资讯
- 💰 **财经查询** - 雪球、股价换算
- 🧮 **知识计算** - 数学单位换算

## 依赖

- OpenClaw 的 `web_fetch` 工具
- 无需额外依赖

---

**超级搜索能力，下载即用！** 🚀
