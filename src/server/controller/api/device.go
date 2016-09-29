package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
)

type DeviceController struct {
}

var (
	device_msg = map[string]string{

		"01030100": "拉取设备详情成功!",
		"01030101": "拉取设备详情失败!",

		"01030200": "拉取用户设备列表成功!",
		"01030201": "拉取用户设备列表失败!",

		"01030300": "拉取用户指定学校设备列表成功!",
		"01030301": "拉取用户指定学校设备列表失败!",

		"01030400": "拉取设备列表成功!",
		"01030401": "拉取设备列表失败!",
	}
)

/**
 * @api {get} /api/device/:id 设备详情
 * @apiName Basic
 * @apiGroup Device
 */
func (self *DeviceController) Basic(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	device, err := deviceService.Basic(id)
	if err != nil {
		result = &enity.Result{"01010101", nil, user_msg["01010101"]}
	} else {
		result = &enity.Result{"01010100", device, user_msg["01010100"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
 * @api {get} /api/device 设备列表
 * @apiName List
 * @apiGroup Device
 */
func (self *DeviceController) List(ctx *iris.Context) {
	filter := ctx.URLParam("filter")
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("per_page")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	if filter == "user" {
		userId, _ := ctx.URLParamInt("user_id")
		list, err := deviceService.ListByUser(userId, page, perPage)
		if err != nil {
			result = &enity.Result{"01030201", nil, device_msg["01030201"]}
		} else {
			result = &enity.Result{"01030200", list, device_msg["01030200"]}
		}
	} else if filter == "user_and_school" {
		userId, _ := ctx.URLParamInt("user_id")
		schoolId, _ := ctx.URLParamInt("school_id")
		list, err := deviceService.ListByUserAndSchool(userId, schoolId, page, perPage)
		if err != nil {
			result = &enity.Result{"01030301", nil, device_msg["01030301"]}
		} else {
			result = &enity.Result{"01030300", list, device_msg["01030300"]}
		}
	} else {
		list, err := deviceService.List(page, perPage)
		if err != nil {
			result = &enity.Result{"01030401", nil, device_msg["01030401"]}
		} else {
			result = &enity.Result{"01030400", list, device_msg["01030400"]}
		}
	}
	ctx.JSON(iris.StatusOK, result)
}
