# 飞书审批自动处理

自动处理飞书审批流程，支持审批通过、拒绝、查询审批状态。

## 配置

在飞书开放平台创建应用并开通审批权限：
https://open.feishu.cn/app

## 使用

```yaml
skill: feishu-approval
params:
  action: "approve"
  approval_id: "xxx"
  comment: "同意"
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| action | ✅ | 操作：approve（通过）、reject（拒绝）、list（列表）、query（查询） |
| approval_id | ❌ | 审批实例ID |
| comment | ❌ | 审批意见 |

## 示例

通过审批：
```yaml
skill: feishu-approval
params:
  action: "approve"
  approval_id: "xxx"
  comment: "同意申请"
```

拒绝审批：
```yaml
skill: feishu-approval
params:
  action: "reject"
  approval_id: "xxx"
  comment: "材料不全，请补充"
```

查询待办审批：
```yaml
skill: feishu-approval
params:
  action: "list"
```

## 权限说明

需要以下审批API权限：
- 审批实例查看
- 审批实例操作