# 钉钉打卡自动化

自动完成钉钉考勤打卡，支持上班打卡、下班打卡、查看考勤记录。

## 配置

获取钉钉Access Token：
1. 登录钉钉开放平台 https://open.dingtalk.com
2. 创建企业内部应用 → 添加考勤API权限

## 使用

```yaml
skill: dingtalk-attendance
params:
  action: "clock_in"
  user_id: "xxx"
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| action | ✅ | 操作：clock_in（上班打卡）、clock_out（下班打卡）、status（查看状态） |
| user_id | ❌ | 员工ID，不填使用默认 |

## 示例

上班打卡：
```yaml
skill: dingtalk-attendance
params:
  action: "clock_in"
```

下班打卡：
```yaml
skill: dingtalk-attendance
params:
  action: "clock_out"
```

查看考勤状态：
```yaml
skill: dingtalk-attendance
params:
  action: "status"
```

## 注意事项

- 需要企业管理员授权考勤权限
- 必须在指定考勤范围内打卡
- 打卡时间需符合企业考勤规则