package controller

import (
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
)

/**
 * @api {All} /api/<%=?%> 状态码
 * @apiGroup Region
 * @apiName Status
 * @apiParam (错误码) {String} 01020100 拉取省列表成功
 * @apiParam (错误码) {String} 01020101 拉取省列表失败
 * @apiParam (错误码) {String} 01020200 拉取城市列表成功
 * @apiParam (错误码) {String} 01020201 拉取城市列表失败
 * @apiParam (错误码) {String} 01020300 拉取区列表成功
 * @apiParam (错误码) {String} 01020301 拉取区列表失败
 * @apiParam (错误码) {String} 01020400 拉取省详情成功
 * @apiParam (错误码) {String} 01020401 拉取省详情失败
 * @apiParam (错误码) {String} 01020500 拉取城市详情成功
 * @apiParam (错误码) {String} 01020501 拉取城市详情失败
 * @apiParam (错误码) {String} 01020600 拉取区域详情成功
 * @apiParam (错误码) {String} 01020601 拉取区域详情失败
 * @apiParam (错误码) {String} 01020700 拉取指定省份的城市列表成功
 * @apiParam (错误码) {String} 01020701 拉取指定省份的城市列表失败
 * @apiParam (错误码) {String} 01020800 拉取指定省份的学校列表成功
 * @apiParam (错误码) {String} 01020801 拉取指定省份的学校列表失败
 * @apiSuccess {String} status 业务状态码
 * @apiSuccess {String} data 业务数据
 * @apiSuccess {String} msg 业务状态描述信息
 * @apiSuccessExample {json} 响应体:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "",
 *       "data": {},
 *       "msg": ""
 *     }
 */
var (
	region_msg = map[string]string{

		"01020100": "拉取省列表成功!",
		"01020101": "拉取省列表失败!",

		"01020200": "拉取城市列表成功!",
		"01020201": "拉取城市列表失败!",

		"01020300": "拉取区列表成功!",
		"01020301": "拉取区列表失败!",
		"01020302": "该城市id不存在!",

		"01020400": "拉取省详情成功!",
		"01020401": "拉取省详情失败!",

		"01020500": "拉取城市详情成功!",
		"01020501": "拉取城市详情失败!",

		"01020600": "拉取区域详情成功!",
		"01020601": "拉取区域详情失败!",

		"01020700": "拉取指定省份的城市列表成功!",
		"01020701": "拉取指定省份的城市列表失败!",
		"01020702": "不存在此省份id!",

		"01020800": "拉取指定省份的学校列表成功!",
		"01020801": "拉取指定省份的学校列表失败!",
		"01020802": "不存在此省份id或该省份没有学校!",
	}
)

type RegionController struct {
}

/**
 * @api {get} /api/province 获取省份列表
 * @apiName Province
 * @apiGroup Region
 *
 * @apiSuccess {Int} id ID
 * @apiSuccess {String} name  名称
 * @apiSuccess {Int} parentId  父级ID
 * @apiSuccess {String} code  邮政编码
 * @apiSuccess {Int} level  级别
 * @apiSuccess {String} levelName  级别名
 * @apiSuccess {String} createdAt  创建时间
 * @apiSuccess {String} updatedAt  更新时间
 * @apiSuccess {String} deletedAt  删除时间
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *	   status: "01020100",
 *	   data: [
 *	       {
 *	           id: 110000,
 *	           createdAt: "0001-01-01T00:00:00Z",
 *	           updatedAt: "0001-01-01T00:00:00Z",
 *	           deletedAt: null,
 *	           name: "北京市",
 *	           parentId: 0,
 *	           code: "010",
 *	           level: 1,
 *	           levelName: "市"
 *	       }
 *        ],
 *        msg: "拉取省列表成功!"
 *     }
 */
func (self *RegionController) Province(ctx *iris.Context) {
	regionService := &service.RegionService{}
	result := &enity.Result{}
	list, err := regionService.Province()
	if err != nil {
		result = &enity.Result{"01020101", err, region_msg["01020101"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	result = &enity.Result{"01020100", list, region_msg["01020100"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
	return
}

/**
 * @api {get} /api/city 获取城市列表
 * @apiName City
 * @apiGroup Region
 *
 * @apiSuccess {Int} id ID
 * @apiSuccess {String} name  名称
 * @apiSuccess {Int} parentId  父级ID
 * @apiSuccess {String} code  邮政编码
 * @apiSuccess {Int} level  级别
 * @apiSuccess {String} levelName  级别名
 * @apiSuccess {String} createdAt  创建时间
 * @apiSuccess {String} updatedAt  更新时间
 * @apiSuccess {String} deletedAt  删除时间
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *	   status: "01020200",
 *	   data: [
 *	       {
 *	           id: 340500,
 *	           createdAt: "0001-01-01T00:00:00Z",
 *	           updatedAt: "0001-01-01T00:00:00Z",
 *	           deletedAt: null,
 *	           name: "铜陵市",
 *	           parentId: 340000,
 *	           code: "0555",
 *	           level: 2,
 *	           levelName: "市"
 *	       }
 *        ],
 *        msg: "拉取城市列表成功!"
 *     }
 */
func (self *RegionController) City(ctx *iris.Context) {
	regionService := &service.RegionService{}
	result := &enity.Result{}
	list, err := regionService.City()
	if err != nil {
		result = &enity.Result{"01020201", err, region_msg["01020101"]}
		common.Log(ctx, result)
	} else {
		result = &enity.Result{"01020200", list, region_msg["01020200"]}
	}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

/**
 * @api {get} /api/city/:id/district 获取区域列表
 * @apiName DistrictOfCity
 * @apiGroup Region
 *
 * @apiSuccess {Int} id ID
 * @apiSuccess {String} name  名称
 * @apiSuccess {Int} parentId  父级ID
 * @apiSuccess {String} code  邮政编码
 * @apiSuccess {Int} level  级别
 * @apiSuccess {String} levelName  级别名
 * @apiSuccess {String} createdAt  创建时间
 * @apiSuccess {String} updatedAt  更新时间
 * @apiSuccess {String} deletedAt  删除时间
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *	   status: "01020300",
 *	   data: [
 *	       {
 *	           id: 110000,
 *	           createdAt: "0001-01-01T00:00:00Z",
 *	           updatedAt: "0001-01-01T00:00:00Z",
 *	           deletedAt: null,
 *	           name: "北京市",
 *	           parentId: 0,
 *	           code: "010",
 *	           level: 1,
 *	           levelName: "市"
 *	       }
 *        ],
 *        msg: "获取区域列表成功!"
 *     }
 */
func (self *RegionController) DistrictOfCity(ctx *iris.Context) {
	regionService := &service.RegionService{}
	id, _ := ctx.ParamInt("id")
	result := &enity.Result{}
	districts, err := regionService.DistrictsOfCity(id)
	if err != nil {
		result = &enity.Result{"01020301", err, region_msg["01020301"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	if districts == nil {
		result = &enity.Result{"01020302", nil, region_msg["01020302"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01020300", districts, region_msg["01020300"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

/**
 * @api {get} /api/province/:id 获取省份详情
 * @apiName ProvinceDetail
 * @apiGroup Region
 *
 * @apiSuccess {Int} id ID
 * @apiSuccess {String} name  名称
 * @apiSuccess {Int} parentId  父级ID
 * @apiSuccess {String} code  邮政编码
 * @apiSuccess {Int} level  级别
 * @apiSuccess {String} levelName  级别名
 * @apiSuccess {String} createdAt  创建时间
 * @apiSuccess {String} updatedAt  更新时间
 * @apiSuccess {String} deletedAt  删除时间
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *	   status: "01020400",
 *	   data: {
 *	           id: 110000,
 *	           createdAt: "0001-01-01T00:00:00Z",
 *	           updatedAt: "0001-01-01T00:00:00Z",
 *	           deletedAt: null,
 *	           name: "北京市",
 *	           parentId: 0,
 *	           code: "010",
 *	           level: 1,
 *	           levelName: "市"
 *        },
 *        msg: "获取省份详情成功!"
 *     }
 */
func (self *RegionController) ProvinceDetail(ctx *iris.Context) {
	regionService := &service.RegionService{}
	id, _ := ctx.ParamInt("id")
	result := &enity.Result{}
	province, err := regionService.Detail(id)
	if err != nil {
		result = &enity.Result{"01020401", err, region_msg["01020401"]}
		common.Log(ctx, result)
		return
	} else {
		result = &enity.Result{"01020400", province, region_msg["01020400"]}
	}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

/**
 * @api {get} /api/city/:id 获取城市详情
 * @apiName CityDetail
 * @apiGroup Region
 *
 * @apiSuccess {Int} id ID
 * @apiSuccess {String} name  名称
 * @apiSuccess {Int} parentId  父级ID
 * @apiSuccess {String} code  邮政编码
 * @apiSuccess {Int} level  级别
 * @apiSuccess {String} levelName  级别名
 * @apiSuccess {String} createdAt  创建时间
 * @apiSuccess {String} updatedAt  更新时间
 * @apiSuccess {String} deletedAt  删除时间
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *	   status: "01020500",
 *	   data: {
 *	           id: 110000,
 *	           createdAt: "0001-01-01T00:00:00Z",
 *	           updatedAt: "0001-01-01T00:00:00Z",
 *	           deletedAt: null,
 *	           name: "北京市",
 *	           parentId: 0,
 *	           code: "010",
 *	           level: 1,
 *	           levelName: "市"
 *        },
 *        msg: "获取城市详情成功!"
 *     }
 */
func (self *RegionController) CityDetail(ctx *iris.Context) {
	regionService := &service.RegionService{}
	id, _ := ctx.ParamInt("id")
	result := &enity.Result{}
	province, err := regionService.Detail(id)
	if err != nil {
		result = &enity.Result{"01020501", err, region_msg["01020501"]}
		common.Log(ctx, result)
	} else {
		result = &enity.Result{"01020500", province, region_msg["01020500"]}
	}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

/**
 * @api {get} /api/district/:id 获取区域详情
 * @apiName DistrictDetail
 * @apiGroup Region
 *
 * @apiSuccess {Int} id ID
 * @apiSuccess {String} name  名称
 * @apiSuccess {Int} parentId  父级ID
 * @apiSuccess {String} code  邮政编码
 * @apiSuccess {Int} level  级别
 * @apiSuccess {String} levelName  级别名
 * @apiSuccess {String} createdAt  创建时间
 * @apiSuccess {String} updatedAt  更新时间
 * @apiSuccess {String} deletedAt  删除时间
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *	   status: "01020600",
 *	   data: {
 *	           id: 110000,
 *	           createdAt: "0001-01-01T00:00:00Z",
 *	           updatedAt: "0001-01-01T00:00:00Z",
 *	           deletedAt: null,
 *	           name: "北京市",
 *	           parentId: 0,
 *	           code: "010",
 *	           level: 1,
 *	           levelName: "市"
 *        },
 *        msg: "获取区域详情成功!"
 *     }
 */
func (self *RegionController) DistrictDetail(ctx *iris.Context) {
	regionService := &service.RegionService{}
	id, _ := ctx.ParamInt("id")
	result := &enity.Result{}
	province, err := regionService.Detail(id)
	if err != nil {
		result = &enity.Result{"01020601", err, region_msg["01020601"]}
		common.Log(ctx, result)
		return
	} else {
		result = &enity.Result{"01020600", province, region_msg["01020600"]}
	}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

/**
 * @api {get} /api/province/:id/city 获取省份城市列表
 * @apiName CityOfProvince
 * @apiGroup Region
 *
 * @apiSuccess {Int} id ID
 * @apiSuccess {String} name  名称
 * @apiSuccess {Int} parentId  父级ID
 * @apiSuccess {String} code  邮政编码
 * @apiSuccess {Int} level  级别
 * @apiSuccess {String} levelName  级别名
 * @apiSuccess {String} createdAt  创建时间
 * @apiSuccess {String} updatedAt  更新时间
 * @apiSuccess {String} deletedAt  删除时间
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *	   status: "01020700",
 *	   data: [
 *	       {
 *	           id: 110000,
 *	           createdAt: "0001-01-01T00:00:00Z",
 *	           updatedAt: "0001-01-01T00:00:00Z",
 *	           deletedAt: null,
 *	           name: "北京市",
 *	           parentId: 0,
 *	           code: "010",
 *	           level: 1,
 *	           levelName: "市"
 *	       }
 *        ],
 *        msg: "获取省份城市列表成功!"
 *     }
 */
func (self *RegionController) CityOfProvince(ctx *iris.Context) {
	regionService := &service.RegionService{}
	id, _ := ctx.ParamInt("id")
	result := &enity.Result{}
	list, err := regionService.CitiesOfProvince(id)
	if err != nil {
		result = &enity.Result{"01020701", err, region_msg["01020701"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	if list == nil {
		result = &enity.Result{"01020702", list, region_msg["01020702"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01020700", list, region_msg["01020700"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

/**
 * @api {get} /api/province/:id/school 获取省份学校列表
 * @apiName SchoolOfProvince
 * @apiGroup Region
 *
 * @apiSuccess {Int} id ID
 * @apiSuccess {String} name  名称
 * @apiSuccess {String} createdAt  创建时间
 * @apiSuccess {String} updatedAt  更新时间
 * @apiSuccess {String} deletedAt  删除时间
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *	   status: "01020800",
 *	   data: [
 *	       {
 *	           id: 11001,
 *	           createdAt: "0001-01-01T00:00:00Z",
 *	           updatedAt: "0001-01-01T00:00:00Z",
 *	           deletedAt: null,
 *	           name: "武汉大学"
 *	       }
 *        ],
 *        msg: "获取省份学校列表成功!"
 *     }
 */
func (self *RegionController) SchoolOfProvince(ctx *iris.Context) {
	regionService := &service.RegionService{}
	id, _ := ctx.ParamInt("id")
	result := &enity.Result{}
	list, err := regionService.SchoolOfProvince(id)
	if err != nil {
		result = &enity.Result{"01020801", err, region_msg["01020801"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	if list == nil {
		result = &enity.Result{"01020802", nil, region_msg["01020802"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01020800", list, region_msg["01020800"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}
