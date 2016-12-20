package controller

import (
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
)

type SchoolController struct {
}

var (
	school_msg = map[string]string{
		"01050100": "拉取学校详情成功",
		"01050101": "拉取学校详情失败",

		"01050200": "全量拉取学校详情成功",
		"01050201": "全量拉取学校详情失败",
	}
)

/**
 * @api {get} /api/school/:id 学校详情
 * @apiName Basic
 * @apiGroup School
	@apiSuccessExample Success-Response:
	 {
	  "status": "01050100",
	  "data": {
	    "id": 1001,
	    "createdAt": "0001-01-01T00:00:00Z",
	    "updatedAt": "0001-01-01T00:00:00Z",
	    "deletedAt": null,
	    "name": "清华大学"
	  },
	  "msg": "拉取学校详情成功"
	}
*/
func (self *SchoolController) Basic(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	schoolService := &service.SchoolService{}
	result := &enity.Result{}
	school, err := schoolService.Basic(id)
	if err != nil {
		result = &enity.Result{"01050101", nil, school_msg["01050101"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	result = &enity.Result{"01050100", school, school_msg["01050100"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

func (self *SchoolController) List(ctx *iris.Context) {
	schoolService := &service.SchoolService{}
	result := &enity.Result{}
	list, err := schoolService.List()
	if err != nil {
		result = &enity.Result{"01050201", nil, school_msg["01050201"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	result = &enity.Result{"01050200", list, school_msg["01050200"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}
