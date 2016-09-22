import api from '../library/axios/api';

// 根据你的接口封装以下服务
const Service = {
  getDetailTradeList: (id) => { //查询某排期&某影厅的订单接口
    return api.get('/api/device/1').then((response) => {
      response.data = {
        "status": "01060200",
        "data": {
          "root": [
            {
              "id": 122,
              "created_at": "2016-09-19T13:41:43+08:00",
              "updated_at": "2016-09-14T13:41:43+08:00",
              "deleted_at": null,
              "trade_no": "2016091901",
              "outer_trade_no": "56789",
              "province_id": 1,
              "city_id": 1,
              "district_id": 1,
              "cinema_id": 1,
              "schedule_id": 1,
              "user_id": 0,
              "hall_id": 1,
              "device_id": 1,
              "total_price": 1999,
              "cash": 0,
              "status": 2,
              "paid_at": "0001-01-01T00:00:00Z",
              "refunded_at": "0001-01-01T00:00:00Z"
            },
            {
              "id": 123,
              "created_at": "2016-09-19T13:46:01+08:00",
              "updated_at": "2016-09-14T13:46:01+08:00",
              "deleted_at": null,
              "trade_no": "2016091903",
              "outer_trade_no": "2133",
              "province_id": 1,
              "city_id": 1,
              "district_id": 1,
              "cinema_id": 1,
              "schedule_id": 1,
              "user_id": 0,
              "hall_id": 1,
              "device_id": 2,
              "total_price": 2599,
              "cash": 0,
              "status": 1,
              "paid_at": "0001-01-01T00:00:00Z",
              "refunded_at": "0001-01-01T00:00:00Z"
            }
          ],
          "total": 2
        },
        "msg": "拉取影厅订单信息列表成功"
      }
      return response.data;
    }, function (response) {
      throw new Error(response.data);
    });
  },
  getTradeList: (id) => { //查询影院各影厅订单接口
    return api.get('/api/device/1').then((response) => {
      response.data = {
        "status": "01060300", 
        "data": [
              {
                "id": 1,
                "created_at": "1999-01-01 00:00:00",    //下单时间(还未确定返回格式)
                "updated_at": null,
                "deleted_at": null,
                "trade_no":  "12323212",        //订单号
                "outer_trade_no": "1111111",    //交易号
                "province_id ": 2, //省份id
                "city_id ": 1, //城市id
                "district_id":  1,//区域id
                "cinema_id ":   1,//影院id
                "schedule_id": 32,//排期id
                "user_id":  1,//用户id
                "hall_id": 1,//影厅id
                "device_id":    1,//设备id
                "total_price":   2500,//总金额
                "cash ":        1900,//实际支付金额
                "status":  1,//(具体状态码后面再给)状态 0:未支付 1:已支付+未发货 2已支付+已发货 3:已支付+发货失败 4已支付+发货失败+退款成功 5:已支付+发货失败+退款成功 6:支付失败
                "paid_at":  "1999-01-01 00:00:10", //支付时间
                "refunded_at":    null,//退票时间
                "trade_goods_rel":[
                    {
                        "goods_id":1, //商品id
                        "price":   1300, //价格
                        "count":    1,//数量,
                        "total_price": "",
                        "favor": {
                            "name":"少冰" //喜好
                        },
                        "goods": {
                            "name":"可乐" //产品
                        }
                    },
                    {
                        "goods_id":2, //商品id
                        "price":   600, //价格
                        "count":    1,//数量
                        "goods": {
                            "name":"牛肉" 
                        }
                    }
                ],
                "cinema" : {
                    "name":"海岸城影城"
                },
                "schedule" : {
                    "name": "冰河世纪32",
                    "show_at":"1474192800"  //时间戳
                },
                "hall" : {  
                    "name" : "1号厅"
                },
                "device": {
                    "row_name":"F排",    //坐标行名
                    "column_name":"17座",    //坐标列名
                    "status":0     //状态 0:正常 1:损坏
                },
              },
              {
                "id": 2,
                "created_at": "1999-01-01 00:00:00",    //下单时间(还未确定返回格式)
                "updated_at": null,
                "deleted_at": null,
                "trade_no":  "12323212",        //订单号
                "outer_trade_no": "1111111",    //交易号
                "province_id ": 2, //省份id
                "city_id ": 1, //城市id
                "district_id":  1,//区域id
                "cinema_id ":   1,//影院id
                "schedule_id": 33,//排期id
                "user_id":  1,//用户id
                "hall_id": 2,//影厅id
                "device_id":    1,//设备id
                "total_price":   2500,//总金额
                "cash ":        1900,//实际支付金额
                "status":  1,//(具体状态码后面再给)状态 0:未支付 1:已支付+未发货 2已支付+已发货 3:已支付+发货失败 4已支付+发货失败+退款成功 5:已支付+发货失败+退款成功 6:支付失败
                "paid_at":  "1999-01-01 00:00:10", //支付时间
                "refunded_at":    null,//退票时间
                "trade_goods_rel":[
                    {
                        "goods_id":1, //商品id
                        "price":   1300, //价格
                        "count":    1,//数量,
                        "total_price": "",
                        "favor": {
                            "name":"少冰" //喜好
                        },
                        "goods": {
                            "name":"可乐" //产品
                        }
                    },
                    {
                        "goods_id":2, //商品id
                        "price":   600, //价格
                        "count":    1,//数量
                        "goods": {
                            "name":"牛肉" 
                        }
                    }
                ],
                "cinema" : {
                    "name":"海岸城影城"
                },
                "schedule" : {
                    "name": "冰河世纪33",
                    "show_at":"1474192800"  //时间戳
                },
                "hall" : {  
                    "name" : "2号厅"
                },
                "device": {
                    "row_name":"F排",    //坐标行名
                    "column_name":"17座",    //坐标列名
                    "status":0     //状态 0:正常 1:损坏
                },
              },
              {
                "id": 2,
                "created_at": "1999-01-01 00:00:00",    //下单时间(还未确定返回格式)
                "updated_at": null,
                "deleted_at": null,
                "trade_no":  "12323212",        //订单号
                "outer_trade_no": "1111111",    //交易号
                "province_id ": 2, //省份id
                "city_id ": 1, //城市id
                "district_id":  1,//区域id
                "cinema_id ":   1,//影院id
                "schedule_id": 33,//排期id
                "user_id":  1,//用户id
                "hall_id": 2,//影厅id
                "device_id":    1,//设备id
                "total_price":   2500,//总金额
                "cash ":        1900,//实际支付金额
                "status":  1,//(具体状态码后面再给)状态 0:未支付 1:已支付+未发货 2已支付+已发货 3:已支付+发货失败 4已支付+发货失败+退款成功 5:已支付+发货失败+退款成功 6:支付失败
                "paid_at":  "1999-01-01 00:00:10", //支付时间
                "refunded_at":    null,//退票时间
                "trade_goods_rel":[
                    {
                        "goods_id":1, //商品id
                        "price":   1300, //价格
                        "count":    1,//数量,
                        "total_price": "",
                        "favor": {
                            "name":"少冰" //喜好
                        },
                        "goods": {
                            "name":"可乐" //产品
                        }
                    },
                    {
                        "goods_id":2, //商品id
                        "price":   600, //价格
                        "count":    1,//数量
                        "goods": {
                            "name":"牛肉" 
                        }
                    }
                ],
                "cinema" : {
                    "name":"海岸城影城"
                },
                "schedule" : {
                    "name": "冰河世纪33",
                    "show_at":"1474192800"  //时间戳
                },
                "hall" : {  
                    "name" : "2号厅"
                },
                "device": {
                    "row_name":"F排",    //坐标行名
                    "column_name":"17座",    //坐标列名
                    "status":0     //状态 0:正常 1:损坏
                },
              },
              {
                "id": 2,
                "created_at": "1999-01-01 00:00:00",    //下单时间(还未确定返回格式)
                "updated_at": null,
                "deleted_at": null,
                "trade_no":  "12323212",        //订单号
                "outer_trade_no": "1111111",    //交易号
                "province_id ": 2, //省份id
                "city_id ": 1, //城市id
                "district_id":  1,//区域id
                "cinema_id ":   1,//影院id
                "schedule_id": 33,//排期id
                "user_id":  1,//用户id
                "hall_id": 4,//影厅id
                "device_id":    1,//设备id
                "total_price":   2500,//总金额
                "cash ":        1900,//实际支付金额
                "status":  1,//(具体状态码后面再给)状态 0:未支付 1:已支付+未发货 2已支付+已发货 3:已支付+发货失败 4已支付+发货失败+退款成功 5:已支付+发货失败+退款成功 6:支付失败
                "paid_at":  "1999-01-01 00:00:10", //支付时间
                "refunded_at":    null,//退票时间
                "trade_goods_rel":[
                    {
                        "goods_id":1, //商品id
                        "price":   1300, //价格
                        "count":    1,//数量,
                        "total_price": "",
                        "favor": {
                            "name":"少冰" //喜好
                        },
                        "goods": {
                            "name":"可乐" //产品
                        }
                    },
                    {
                        "goods_id":2, //商品id
                        "price":   600, //价格
                        "count":    1,//数量
                        "goods": {
                            "name":"牛肉" 
                        }
                    }
                ],
                "cinema" : {
                    "name":"海岸城影城"
                },
                "schedule" : {
                    "name": "冰河世纪33",
                    "show_at":"1474192800"  //时间戳
                },
                "hall" : {  
                    "name" : "4号厅"
                },
                "device": {
                    "row_name":"F排",    //坐标行名
                    "column_name":"17座",    //坐标列名
                    "status":0     //状态 0:正常 1:损坏
                },
              },
              {
                "id": 3,
                "created_at": "1999-01-01 00:00:00",    //下单时间(还未确定返回格式)
                "updated_at": null,
                "deleted_at": null,
                "trade_no":  "12323212",        //订单号
                "outer_trade_no": "1111111",    //交易号
                "province_id ": 2, //省份id
                "city_id ": 1, //城市id
                "district_id":  1,//区域id
                "cinema_id ":   1,//影院id
                "schedule_id": 34,//排期id
                "user_id":  1,//用户id
                "hall_id": 3,//影厅id
                "device_id":    1,//设备id
                "total_price":   2500,//总金额
                "cash ":        1900,//实际支付金额
                "status":  1,//(具体状态码后面再给)状态 0:未支付 1:已支付+未发货 2已支付+已发货 3:已支付+发货失败 4已支付+发货失败+退款成功 5:已支付+发货失败+退款成功 6:支付失败
                "paid_at":  "1999-01-01 00:00:10", //支付时间
                "refunded_at":    null,//退票时间
                "trade_goods_rel":[
                    {
                        "goods_id":1, //商品id
                        "price":   1300, //价格
                        "count":    1,//数量,
                        "total_price": "",
                        "favor": {
                            "name":"少冰" //喜好
                        },
                        "goods": {
                            "name":"可乐" //产品
                        }
                    },
                    {
                        "goods_id":2, //商品id
                        "price":   600, //价格
                        "count":    1,//数量
                        "goods": {
                            "name":"牛肉" 
                        }
                    }
                ],
                "cinema" : {
                    "name":"海岸城影城"
                },
                "schedule" : {
                    "name": "冰河世纪34",
                    "show_at":"1474192800"  //时间戳
                },
                "hall" : {  
                    "name" : "3号厅"
                },
                "device": {
                    "row_name":"F排",    //坐标行名
                    "column_name":"17座",    //坐标列名
                    "status":0     //状态 0:正常 1:损坏
                },
              }
        ],
        "msg": "拉取影厅订单详情成功"
      }
      return response.data;
    }, function (response) {
      throw new Error(response.data);
    });
  }
  
};

export default Service;
