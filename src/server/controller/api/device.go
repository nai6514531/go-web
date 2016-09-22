package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/smart-cinema/src/server/enity"
	"maizuo.com/smart-cinema/src/server/service"
	"strconv"
	"fmt"
)

var (
	device_msg = map[string]string{
		"01030101": "请求参数异常",

		"01030200": "拉取设备信息成功",
		"01030201": "拉取设备信息失败",

		"01030301": "设备已损坏",
		"01030302": "影院已下线",
		"01030303": "影厅已下线",
	}
)

type DeviceController struct {
}

func (self *DeviceController) Detail(ctx *iris.Context) {
	deviceService := &service.DeviceService{}
	result := &enity.Result{}

	id, err := strconv.Atoi(ctx.Param("id"))
	fmt.Println("err1=", err)
	if err != nil {
		result = &enity.Result{"01030101", nil, device_msg["01030101"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}

	deviceMap, err := deviceService.Detail(id)
	fmt.Println("err2=", err)
	if err != nil {
		result = &enity.Result{"01030201", &deviceMap, device_msg["01030201"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	fmt.Println(deviceMap)

	fmt.Println(deviceMap["status"])
	if deviceMap["status"] == 1 {
		result = &enity.Result{"01030301", &deviceMap, device_msg["01030301"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	cinema := deviceMap["cinema"]
	if cinema != nil {
		cmap := cinema.(map[string]interface{})
		if cmap["status"] == 1 {
			result = &enity.Result{"01030302", &deviceMap, device_msg["01030302"]}
			ctx.JSON(iris.StatusOK, &result)
			return
		}
	}
	hall := deviceMap["hall"]
	if hall != nil {
		hmap := hall.(map[string]interface{})
		if hmap["status"] == 1 {
			result = &enity.Result{"01030303", &deviceMap, device_msg["01030303"]}
			ctx.JSON(iris.StatusOK, &result)
			return
		}
	}
	result = &enity.Result{"01030200", &deviceMap, device_msg["01030200"]}
	ctx.JSON(iris.StatusOK, &result)
	return
}
