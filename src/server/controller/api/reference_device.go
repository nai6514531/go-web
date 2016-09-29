package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/enity"
)

type ReferenceDeviceController struct {
}

var (
	reference_device_msg = map[string]string{

		"01040100": "拉取关联设备详情成功!",
		"01040101": "拉取关联设备详情失败!",

		"01040200": "拉取关联设备列表成功!",
		"01040201": "拉取关联设备列表失败!",
	}
)

/**
 * @api {get} /api/reference-device/:id 设备详情
 * @apiName Basic
 * @apiGroup Device
 */
func (self *ReferenceDeviceController) Basic(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	referenceDeviceService := &service.ReferenceDeviceService{}
	result := &enity.Result{}
	referenceDevice, err := referenceDeviceService.Basic(id)
	if err != nil {
		result = &enity.Result{"01040101", nil, user_msg["01040101"]}
	} else {
		result = &enity.Result{"01040100", referenceDevice, user_msg["01040100"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
 * @api {get} /api/reference-device 关联设备列表
 * @apiName List
 * @apiGroup Reference-Device
 */
func (self *ReferenceDeviceController) List(ctx *iris.Context) {
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("per_page")
	referenceDeviceService := &service.ReferenceDeviceService{}
	result := &enity.Result{}
	list, err := referenceDeviceService.List(page, perPage)
	if err != nil {
		result = &enity.Result{"01040201", nil, reference_device_msg["01040201"]}
	} else {
		result = &enity.Result{"01040200", list, reference_device_msg["01040200"]}
	}
	ctx.JSON(iris.StatusOK, result)
}
