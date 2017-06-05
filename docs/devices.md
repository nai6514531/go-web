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