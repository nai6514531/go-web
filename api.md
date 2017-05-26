FORMAT: 1A
HOST: http://mng.huacetech.cn/api/v1

# 苏打生活B端系统API

## 说明
> 

# Data Structures

## ResetPassword
+ type: 1 (required, number) - 用户账户类型，1为B端用户，2为C用户
+ password: 123456 (required) - 重置后的用户密码，明文
+ account: kefu (required) - 用户登录账号

# Group 用户
>

## 重置 C & B 端用户密码 [/user/reset-password]
> 

### 重置 C & B 端用户密码 [POST]

参数 | 类型 | 描述
--:| ---- | -----------
type | required, number  | 用户账户类型，1为B端用户，2为C用户
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

## 重置设备密码计数 [/device-step]
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
# Group IC卡
>

## 获取ic卡充值记录 [/chipcard/recharge{?mobile,page,perPage}]
> 

### 获取ic卡充值记录 [GET]

+ Parameters
	 + mobile: `13681010234` (string, required) - 手机号码.
	 + page: `1` (number, required) - 第几页.
	 + perPage: `20` (number, required) - 每页多少项.
+ Response 01080300 (application/json)
    + Body
    
         {
    "status": "01080300",
    "data": {
        "total": 164297,
        "list": [
            {
                "id": 162179,
                "rechargeId": "457709809987",
                "userId": 996581,
                "billId": "45770980989878",
                "count": 1,
                "snapshot": '[{"id":3367,"name":"赵俊翔"},{"id":3355,"name":"刘小松"}]',
                "extra": "额外描述",
                "status":7,
                "createdAt": "2017-03-12T02:10:38+08:00",
                "updatedAt": "2017-03-13T12:22:14+08:00",
                "deletedAt": null,
                "created_timestamp": 14987767633,
                "value": 400,
                "operatorId": 998664,
                "mobile": "15995952618"
            },
            {
              "id": 162180,
              "rechargeId": "457709809987",
              "userId": 996581,
              "billId": "45770980989878",
              "count": 1,
              "snapshot": "[{'id':3367,'name':'赵俊翔'},{'id':3355,'name':'刘小松'}]",
              "extra": "额外描述",
              "status": 7,
              "createdAt": "2017-03-12T02:10:38+08:00",
              "updatedAt": "2017-03-13T12:22:14+08:00",
              "deletedAt": null,
              "created_timestamp": 14987767633,
              "value": 400,
              "operatorId": 998664,
              "mobile": "15995952618"
          }
        ]
    },
    "msg": "拉取充值记录列表成功"
}
+ Response 01080301 (application/json)
    + Body

            {
                "status": 01080301,
                "msg":"拉取失败",
                "data":{}
            }
## 对用户进行充值操作 [/chipcard/recharge]
> 

### 对用户进行充值操作 [POST]
参数 | 类型 | 描述
--:| ---- | -----------
mobile | required, string  | 手机号码
amount | required,number  | 充值金额
applyProviders | required,array  | 适用商家账号

+ Request with body (application/json)

    + Body

            {
                "mobile": "136777777777",
                "amount": 12.4,
                "applyProviders":["admin","tester"]
            }

+ Response 01080400 (application/json)
    + Body

            {
                "status": 01080400,
                "msg":"充值成功",
                "data":{
                        	"id": 162179,
                        	"createdAt": "2017-03-12T02:10:38+08:00",
                        	"updatedAt": "2017-03-13T12:22:14+08:00",
                        	"deletedAt": null,
                        	"applyProviders": "3367,3455,4455",
                        	"applyProvidersNames": "赵俊翔,刘小松,李辉民",
                        	"amount": 400,
                        	"operator": 998664,
                        	"mobile": "15995952618"
                       }
            }
+ Response 01080401 (application/json)
    + Body

            {
                "status": 01080401,
                "msg":"充值失败",
                "data":{}
            }
+ Response 01080402 (application/json)
    + Body

            {
                "status": 01080402,
                "msg":"参数异常，请检查请求参数",
                "data":{}
            }
+ Response 01080403 (application/json)
    + Body

            {
                "status": 01080403,
                "msg":"学生登录手机号不存在，请检查",
                "data":{}
            }
+ Response 01080404 (application/json)
    + Body

            {
                "status": 01080404,
                "msg":"该学生用户已被其它商家操作充值，此次充值失败，请联系苏打生活工作人员解决",
                "data":{}
            }
+ Response 01080405 (application/json)
    + Body

            {
                "status": 01080405,
                "msg":"有不存在的商家账号，请检查",
                "data":{}
            }
