# 微信读书笔记同步

将微信读书中的划线和笔记同步保存到本地，支持Markdown格式。

## 使用场景

- 导出微信读书中的书籍笔记
- 备份阅读心得
- 整理阅读资料

## 使用

```yaml
skill: wechat-reader
params:
  action: "export"
  book_id: "xxx"  # 微信读书书籍ID
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| action | ✅ | 操作：export（导出笔记） |
| book_id | ❌ | 书籍ID，不填则列出所有书籍 |

## 示例

列出所有书籍：
```yaml
skill: wechat-reader
params:
  action: "list"
```

导出某本书的笔记：
```yaml
skill: wechat-reader
params:
  action: "export"
  book_id: "123456"
```

## 输出格式

导出为Markdown文件，包含：
- 书籍信息
- 章节结构
- 划线内容
- 个人笔记