# Group IC卡
>

## ic卡充值 [/chipcard/recharge]
>

### 获取ic卡充值记录 [GET /chipcard/recharge{?mobile,page,perPage}]

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

### 对用户进行充值操作 [POST /chipcard/recharge]

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
                "status": "01080400",
                "data": {
                    "id": 77,
                    "createdAt": "2017-06-06T18:12:56.407582523+08:00",
                    "updatedAt": "2017-06-06T18:12:56.407582523+08:00",
                    "deletedAt": null,
                    "recharge_id": "1706063950772217",
                    "user_id": 941618,
                    "mobile": "13145823950",
                    "operator_id": 404,
                    "chipcard_id": 11,
                    "bill_id": "1706063950328294",
                    "snapshot": "[{\"id\":2,\"name\":\"系 统 管 理 员\"}]",
                    "count": 1,
                    "value": 1200,
                    "extra": "",
                    "status": 7,
                    "created_timestamp": 1496743976
                },
                "msg": "充值成功"
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

## 学生IC卡 [/chipcard]

### 获取基本信息 [GET /chipcard{?mobile}]

+ Parameters
  + mobile: '13260644577' (string,required)

+ Response 01080600
  + Body

            {
                "status": 01080600,
                "msg":"查询成功",
                "data":{
                    "id": 162179,
                    "user_id": 162179,
                    "id": 162179,
                    "createdAt": "2017-03-12T02:10:38+08:00",
                    "updatedAt": "2017-03-13T12:22:14+08:00",
                    "deletedAt": null,
                    "status":"0",
                    "value": 400,
                    "operator_id": 998664,
                    "mobile": "15995952618"
                    "applyProviders":[
                        {
                            "id": 2,
                            "name": "系 统 管 理 员",
		                	"contact": "这 里 填 的 是 联 系 人",
		                	"address": "我 是 地 址",
		                	"mobile": "12346512312",
		                	"account": "admin",
		                	"password": "e10adc3949ba59abbe56e057f20f883e",
		                	"telephone": "123465",
		                	"email": "",
		                	"parent_id": 2,
		                	"gender": 0,
		                	"age": 0,
		                	"status": 0,
		                	"created_at": "2017-01-11 11:45:19",
		                	"updated_at": "2017-05-04 16:36:06",
		                	"deleted_at": null
		                },
		                {
		                	"id": 6,
		                	"name": "陈超",
		                	"contact": "陈超",
		                	"address": "湖南长沙林科大",
		                	"mobile": "15211060787",
		                	"account": "ccq060787",
		                	"password": "e10adc3949ba59abbe56e057f20f883e",
		                	"telephone": "15211060787",
		                	"email": "",
		                	"parent_id": 5,
		                	"gender": 0,
		                	"age": 0,
		                	"status": 0,
		                	"created_at": "2016-12-01 01:52:47",
		                	"updated_at": "2017-05-03 18:20:04",
                            "deleted_at": null
		                }
	                ]
                }
            }

### 变更适用商家 [POST /chipcard/relation]

+ Request with body
  + Body

            {
                "id":175871,
                "applyProviders":["admin","tester"]
            }
  + Schema

            {
                "type":"object",
                "properties":[{
                    "title":"id",
                    "type":"int",
                    "description":"芯片卡的ID"
                },
                {
                    "title":"applyProviders",
                    "description":"适用商家的账号列表"，
                    "type":"array",
                    "properties":{
                        "type":"string",
                        "description":"适用商家的账号"
                    }
                }]
            }
+ Response 01080500
  + Body

            {
                "status": 01080500,
                "msg":"修改成功",
                "data":{
                    "id": 162179,
                    "user_id": 162179,
                    "id": 162179,
                    "createdAt": "2017-03-12T02:10:38+08:00",
                    "updatedAt": "2017-03-13T12:22:14+08:00",
                    "deletedAt": null,
                    "status":"0",
                    "value": 400,
                    "operator_id": 998664,
                    "mobile": "15995952618"
                    "applyProviders":[
                        {
                            "id": 2,
                            "name": "系 统 管 理 员",
		                	"contact": "这 里 填 的 是 联 系 人",
		                	"address": "我 是 地 址",
		                	"mobile": "12346512312",
		                	"account": "admin",
		                	"password": "e10adc3949ba59abbe56e057f20f883e",
		                	"telephone": "123465",
		                	"email": "",
		                	"parent_id": 2,
		                	"gender": 0,
		                	"age": 0,
		                	"status": 0,
		                	"created_at": "2017-01-11 11:45:19",
		                	"updated_at": "2017-05-04 16:36:06",
		                	"deleted_at": null
		                },
		                {
		                	"id": 6,
		                	"name": "陈超",
		                	"contact": "陈超",
		                	"address": "湖南长沙林科大",
		                	"mobile": "15211060787",
		                	"account": "ccq060787",
		                	"password": "e10adc3949ba59abbe56e057f20f883e",
		                	"telephone": "15211060787",
		                	"email": "",
		                	"parent_id": 5,
		                	"gender": 0,
		                	"age": 0,
		                	"status": 0,
		                	"created_at": "2016-12-01 01:52:47",
		                	"updated_at": "2017-05-03 18:20:04",
                            "deleted_at": null
		                }
	                ]
                }
            }