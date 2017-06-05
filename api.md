FORMAT: 1A
HOST: http://mng.huacetech.cn/api/v1

# 苏打生活B端系统API

## 说明

>This is an api doc for Soda-manager Systerm

# Data Structures

## ResetPassword

+ type: 1 (required, number) - 用户账户类型，1为B端用户，2为C用户
+ password: 123456 (required) - 重置后的用户密码，明文
+ account: kefu (required) - 用户登录账号

<!-- include(docs/users.md) -->

<!-- include(docs/devices.md) -->

<!-- include(docs/trades.md) -->