# Group IC卡
>

## 获取ic卡充值记录 [/chipcard/recharge{?mobile,page,perPage}]
>

### 获取ic卡充值记录 [GET]

>分页获取

+ Parameters
  + mobile: `13681010234` (string, optional) - 手机号码.
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
