package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
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
	@api {get} /api/reference-device/:id 设备详情
  	@apiName Basic
 	@apiGroup Reference-Device
 	@apiSuccessExample 请求成功
 	{
	  "status": "01040100",
	  "data": {
	    "id": 2,
	    "created_at": "0001-01-01T00:00:00Z",
	    "updated_at": "0001-01-01T00:00:00Z",
	    "deleted_at": null,
	    "name": "充电桩"
	  },
	  "msg": "拉取关联设备详情成功!"
	}
*/
func (self *ReferenceDeviceController) Basic(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	referenceDeviceService := &service.ReferenceDeviceService{}
	result := &enity.Result{}
	referenceDevice, err := referenceDeviceService.Basic(id)
	if err != nil {
		result = &enity.Result{"01040101", nil, reference_device_msg["01040101"]}
	} else {
		result = &enity.Result{"01040100", referenceDevice, reference_device_msg["01040100"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
 	@api {get} /api/reference-device 关联设备列表
  	@apiName List
 	@apiGroup Reference-Device
 	@apiSuccessExample 请求成功
	{
	  "status": "01040200",
	  "data": [
	    {
	      "id": 1,
	      "created_at": "0001-01-01T00:00:00Z",
	      "updated_at": "0001-01-01T00:00:00Z",
	      "deleted_at": null,
	      "name": "洗衣机"
	    },
	    {
	      "id": 2,
	      "created_at": "0001-01-01T00:00:00Z",
	      "updated_at": "0001-01-01T00:00:00Z",
	      "deleted_at": null,
	      "name": "充电桩"
	    },
	    {
	      "id": 3,
	      "created_at": "0001-01-01T00:00:00Z",
	      "updated_at": "0001-01-01T00:00:00Z",
	      "deleted_at": null,
	      "name": "GPRS模块洗衣机"
	    }...
	  ],
	  "msg": "拉取关联设备列表成功!"
	}
*/
func (self *ReferenceDeviceController) List(ctx *iris.Context) {
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("perPage")
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
