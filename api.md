FORMAT: 1A
HOST: http://mng.huacetech.cn/api/v1

# 苏打生活B端系统API

## 说明
> 

# Data Structures

## ResetPassword
+ type: 1 (required, number) - 用户账户类型，1为C端用户，2为B用户
+ password: 123456 (required) - 重置后的用户密码，明文
+ account: kefu (required) - 用户登录账号

# Group 用户
>

## 重置 C & B 端用户密码 [/user/reset-password]
> 

### 重置 C & B 端用户密码 [POST]

参数 | 类型 | 描述
--:| ---- | -----------
type | required, number  | 用户账户类型，1为C端用户，2为B用户
password | required,string  | 重置后的用户密码，明文
account | required,string  | 用户登录账号


+ Request with body (application/json)

    + Body

            {
                "type": 1,
                "password": "123456",
                "account":"kefu"
            }

+ Response 01011700 (application/json)
    + Body

            {
                "status": 01011700,
                "msg":"重置密码成功",
                "data":{}
            }
+ Response 01011701 (application/json)
    + Body

            {
                "status": 01011701,
                "msg":"重置密码失败",
                "data":{}
            }
+ Response 01011702 (application/json)
    + Body

            {
                "status": 01011702,
                "msg":"当前账号权限不足，不能重置密码",
                "data":{}
            }
+ Response 01011703 (application/json)
    + Body

            {
                "status": 01011703,
                "msg":"重置密码异常，请稍后再试！",
                "data":{}
            }
+ Response 01011704 (application/json)
    + Body

            {
                "status": 01011704,
                "msg":"账号不存在",
                "data":{}
            }
+ Response 01011705 (application/json)
    + Body

            {
                "status": 01011705,
                "msg":"参数异常，请检查请求参数",
                "data":{}
            }

# Group 设备
>

## 重置设备密码计数 [/device/reset-step]
> 

### 重置设备密码计数 [POST]

参数 | 类型 | 描述
--:| ---- | -----------
step | required, number  | 密码计数
serialNumber | required,string  | 设备编号


+ Request with body (application/json)

    + Body

            {
                "step": 13,
                "serialNumber": "123456"
            }

+ Response 01031600 (application/json)
    + Body

            {
                "status": 01031600,
                "msg":"更新设备密码计数成功",
                "data":{}
            }
+ Response 01031601 (application/json)
    + Body

            {
                "status": 01031601,
                "msg":"更新设备密码计数失败",
                "data":{}
            }
+ Response 01031602 (application/json)
    + Body

            {
                "status": 01031602,
                "msg":"参数异常，请检查请求参数",
                "data":{}
            }
+ Response 01031603 (application/json)
    + Body

            {
                "status": 01011703,
                "msg":"设备不存在",
                "data":{}
            }