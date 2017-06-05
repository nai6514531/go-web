
# Group 用户

>B端用户API群

## 用户账号

## 用户权限 [/user/permission]

### 芯片卡功能权限 [GET /permission/is-chipcard-operator]

>直接验证当前用户是否拥有芯片卡余额转移功能的权限

+ Response 01011300 (applycation/json)
  + body
    {
        "status":"01011300",
        "msg":"拉取用户权限列表成功",
        "data":true
    }
  + schema
    {
        "title":"data"
        "type":"boolean"
    }

## 重置 C & B 端用户密码 [/user/reset-password]

>该接口负责用户密码重置，会自动从session中提取当前登录用户的ID

### 重置 C & B 端用户密码 [POST]

参数 | 类型 | 描述
--:| ---- | -----------
type | required, number  | 用户账户类型，1为B端用户，2为C用户
password | required,string  | 重置后的用户密码，明文
account | required,string  | 用户登录账号

+ Request (application/json)
  + body

            {
                "type": 1,
                "password": "123456",
                "account":"kefu"
            }
  + Schema
    {
        "type":"object",
        "properties":{
            "type": {
                "description":"用户账户类型"
                "type":"enum",
                "enum":[{"B端用户":1},{"C端用户":2}]
            },
            "password": {
                "type":"string"
            },
            "account":{
                "type":"string"
            }
        },
        "required":["type","password","account"]
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