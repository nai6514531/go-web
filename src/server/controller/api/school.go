package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
)

type SchoolController struct {
}

var (
	school_msg = map[string]string{
		"01050100": "拉取学校详情成功",
		"01050101": "拉取学校详情失败",
	}
)

/**
 * @api {get} /api/school/:id 学校详情
 * @apiName Basic
 * @apiGroup School
 */
func (self *SchoolController) Basic(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	schoolService := &service.SchoolService{}
	result := &enity.Result{}
	school, err := schoolService.Basic(id)
	if err != nil {
		result = &enity.Result{"01050101", nil, school_msg["01050101"]}
	} else {
		result = &enity.Result{"01050100", school, school_msg["01050100"]}
	}
	ctx.JSON(iris.StatusOK, result)
}
