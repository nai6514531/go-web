package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/service"
	"strings"
)

type DeviceController struct {
}

var (
	device_msg = map[string]string{

		"01030100": "拉取设备详情成功!",
		"01030101": "拉取设备详情失败!",

		"01030200": "更新设备状态成功!",
		"01030201": "更新设备状态失败!",
		"01030202": "设备id不能小于0!",
		"01030203": "设备状态不能小于0!",

		"01030300": "更新设备成功!",
		"01030301": "更新设备失败!",
		"01030302": "请填写设备编号!",
		"01030303": "设备编号格式不对,长度为10位!",
		"01030304": "请选择省份!",
		"01030305": "请选择学校!",
		"01030306": "请填写楼层信息!",
		"01030307": "请选择关联设备!",
		"01030308": "请填写单脱价格!",
		"01030309": "请填写快洗价格!",
		"01030310": "请填写标准洗价格!",
		"01030311": "请填写大件洗价格!",
		"01030312": "请填写大件洗价格!",

		"01030400": "拉取设备列表成功!",
		"01030401": "拉取设备列表失败!",

		"01030500": "更新设备成功!",
		"01030501": "更新设备失败!",
		"01030502": "请填写设备编号!",
		"01030503": "设备编号格式不对,长度为10位!",
		"01030504": "请选择省份!",
		"01030505": "请选择学校!",
		"01030506": "请填写楼层信息!",
		"01030507": "请选择关联设备!",
		"01030508": "请填写单脱价格!",
		"01030509": "请填写快洗价格!",
		"01030510": "请填写标准洗价格!",
		"01030511": "请填写大件洗价格!",

		"01030600": "删除设备成功!",
		"01030601": "删除设备失败!",
		"01030602": "设备id不能小于0!",

		"01030700": "添加设备成功!",
		"01030701": "添加设备失败!",
		"01030702": "请填写设备编号!",
		"01030703": "设备编号格式不对,长度为10位!",
		"01030704": "请选择省份!",
		"01030705": "请选择学校!",
		"01030706": "请填写楼层信息!",
		"01030707": "请选择关联设备!",
		"01030708": "请填写单脱价格!",
		"01030709": "请填写快洗价格!",
		"01030710": "请填写标准洗价格!",
		"01030711": "请填写大件洗价格!",
		"01030712": "请填写大件洗价格!",

		"01030800": "更新设备脉冲名成功!",
		"01030801": "更新设备脉冲名失败!",
		"01030802": "设备id不能小于0!",
		"01030803": "设备脉冲名不能为空!",
	}
)

/**
	@api {get} /api/device/:id 设备详情
	@apiName Basic
	@apiGroup Device
  	@apiSuccessExample 成功返回
	{
	  "status": "01030100",
	  "data": {
	    "id": 3,
	    "created_at": "0001-01-01T00:00:00Z",
	    "updated_at": "0001-01-01T00:00:00Z",
	    "deleted_at": null,
	    "user_id": 0,
	    "label": "",
	    "serial_number": "",
	    "reference_device_id": 0,
	    "province_id": 0,
	    "city_id": 0,
	    "district_id": 0,
	    "school_id": 0,
	    "address": "",
	    "first_pulse_price": 0,
	    "second_pulse_price": 0,
	    "third_pulse_price": 0,
	    "fourth_pulse_price": 0,
	    "first_pulse_name": "",
	    "second_pulse_name": "",
	    "third_pulse_name": "",
	    "fourth_pulse_name": "",
	    "status": 0
	  },
	  "msg": "拉取设备详情成功"
	}
	@apiParam (错误码) {String} 01030101 拉取设备详情失败
*/
func (self *DeviceController) Basic(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	device, err := deviceService.Basic(id)
	if err != nil {
		result = &enity.Result{"01030101", nil, device_msg["01030101"]}
	} else {
		result = &enity.Result{"01030100", device, device_msg["01030100"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
 	@api {get} /api/device 设备列表
 	@apiName List
	@apiGroup Device
 	@apiSuccessExample 成功返回
 	{
	  "status": "01030400",
	  "data": [
	    {
	      "id": 3,
	      "created_at": "0001-01-01T00:00:00Z",
	      "updated_at": "0001-01-01T00:00:00Z",
	      "deleted_at": null,
	      "user_id": 0,
	      "label": "",
	      "serial_number": "",
	      "reference_device_id": 0,
	      "province_id": 0,
	      "city_id": 0,
	      "district_id": 0,
	      "school_id": 0,
	      "address": "",
	      "first_pulse_price": 0,
	      "second_pulse_price": 0,
	      "third_pulse_price": 0,
	      "fourth_pulse_price": 0,
	      "first_pulse_name": "",
	      "second_pulse_name": "",
	      "third_pulse_name": "",
	      "fourth_pulse_name": "",
	      "status": 0
	    }...
	  ],
	  "msg": "拉取设备列表成功!"
	}
	@apiParam (错误码) {String} 01030401 拉取设备列表失败
*/
func (self *DeviceController) List(ctx *iris.Context) {
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("per_page")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	list, err := deviceService.List(page, perPage)
	listTotalNum, _ := deviceService.Count()
	if err != nil {
		result = &enity.Result{"01030401", nil, device_msg["01030401"]}
	} else {
		result = &enity.Result{"01030400", &enity.ListResult{listTotalNum, list}, device_msg["01030400"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
 * @api {patch} /api/device/:id/status 更新设备状态
 * @apiName UpdateStatus
 * @apiGroup Device
 */
func (self *DeviceController) UpdateStatus(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	var device model.Device
	ctx.ReadJSON(&device)
	if id <= 0 {
		result = &enity.Result{"01030302", nil, device_msg["01030302"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.Status < 0 {
		result = &enity.Result{"01030203", nil, device_msg["01030203"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	device.Id = id
	success := deviceService.UpdateStatus(device)
	if !success {
		result = &enity.Result{"01030201", nil, device_msg["01030201"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01030200", nil, device_msg["01030200"]}
	ctx.JSON(iris.StatusOK, result)
}

/**
 * @api {put} /api/device/:id 更新设备
 * @apiName Update
 * @apiGroup Device
 */
func (self *DeviceController) Update(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	var device model.Device
	ctx.ReadJSON(&device)
	if id <= 0 {
		result = &enity.Result{"01030312", nil, device_msg["01030312"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.SerialNumber == "" {
		result = &enity.Result{"01030302", nil, device_msg["01030302"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if len(device.SerialNumber) != 10 {
		result = &enity.Result{"01030303", nil, device_msg["01030303"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.ProvinceId <= 0 {
		result = &enity.Result{"01030304", nil, device_msg["01030304"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.SchoolId <= 0 {
		result = &enity.Result{"01030305", nil, device_msg["01030305"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.Label == "" {
		result = &enity.Result{"01030306", nil, device_msg["01030306"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.ReferenceDeviceId <= 0 {
		result = &enity.Result{"01030307", nil, device_msg["01030307"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.FirstPulsePrice <= 0 {
		result = &enity.Result{"01030308", nil, device_msg["01030308"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.SecondPulsePrice <= 0 {
		result = &enity.Result{"01030309", nil, device_msg["01030309"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.ThirdPulsePrice <= 0 {
		result = &enity.Result{"01030310", nil, device_msg["01030310"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.FourthPulsePrice <= 0 {
		result = &enity.Result{"01030311", nil, device_msg["01030311"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	device.Id = id
	success := deviceService.Update(device)
	if !success {
		result = &enity.Result{"01030301", nil, device_msg["01030301"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01030300", nil, device_msg["01030300"]}
	ctx.JSON(iris.StatusOK, result)
}

/**
 * @api {put} /api/device/:id/serial-number 通过编号更新设备
 * @apiName UpdateBySerialNumber
 * @apiGroup Device
 */
func (self *DeviceController) UpdateBySerialNumber(ctx *iris.Context) {
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	var device model.Device
	ctx.ReadJSON(&device)
	if device.SerialNumber == "" {
		result = &enity.Result{"01030502", nil, device_msg["01030502"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if len(device.SerialNumber) != 10 {
		result = &enity.Result{"01030503", nil, device_msg["01030503"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.ProvinceId <= 0 {
		result = &enity.Result{"01030504", nil, device_msg["01030504"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.SchoolId <= 0 {
		result = &enity.Result{"01030505", nil, device_msg["01030505"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.Label == "" {
		result = &enity.Result{"01030506", nil, device_msg["01030506"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.ReferenceDeviceId <= 0 {
		result = &enity.Result{"01030507", nil, device_msg["01030507"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.FirstPulsePrice <= 0 {
		result = &enity.Result{"01030508", nil, device_msg["01030508"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.SecondPulsePrice <= 0 {
		result = &enity.Result{"01030509", nil, device_msg["01030509"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.ThirdPulsePrice <= 0 {
		result = &enity.Result{"01030510", nil, device_msg["01030510"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.FourthPulsePrice <= 0 {
		result = &enity.Result{"01030511", nil, device_msg["01030511"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	success := deviceService.UpdateBySerialNumber(device)
	if !success {
		result = &enity.Result{"01030501", nil, device_msg["01030501"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01030500", nil, device_msg["01030500"]}
	ctx.JSON(iris.StatusOK, result)
}

/**
 * @api {delete} /api/device/:id 删除设备
 * @apiName Delete
 * @apiGroup Device
 */
func (self *DeviceController) Delete(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	if id <= 0 {
		result = &enity.Result{"01030603", nil, device_msg["01030603"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	success := deviceService.Delete(id)
	if !success {
		result = &enity.Result{"01030601", nil, device_msg["01030601"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01030600", nil, device_msg["01030600"]}
	ctx.JSON(iris.StatusOK, result)
}

/**
 	@api {post} /api/device 添加设备
 	@apiName Create
 	@apiGroup Device
  	@apiParamExample {json} 请求例子:
	{
		"serial_number":"abcdefghiw",
		"province_id":440000,
		"school_id":12051,
		"label":"一楼",
		"reference_device_id":1,
		"first_pulse_price":10,
		"second_pulse_price":20,
		"third_pulse_price":30,
		"fourth_pulse_price":40
	}
	@apiSuccessExample 成功返回:
 	HTTP/1.1 200 OK
	{
		"status": "01030700",
		"data": null,
		"msg": "添加设备成功!"
	}
	@apiParam (错误码) {String} 01030701 添加设备失败
	@apiParam (错误码) {String} 01030702 请填写设备编号
	@apiParam (错误码) {String} 01030703 设备编号格式不对,长度为10位!
	@apiParam (错误码) {String} 01030704 请选择省份
	@apiParam (错误码) {String} 01030705 请选择学校
	@apiParam (错误码) {String} 01030706 请填写楼层信息
	@apiParam (错误码) {String} 01030707 请选择关联设备
	@apiParam (错误码) {String} 01030708 请填写单脱价格
	@apiParam (错误码) {String} 01030709 请填写快洗价格
	@apiParam (错误码) {String} 01030710 请填写标准洗价格
	@apiParam (错误码) {String} 01030711 请填写大件洗价格
	@apiParam (错误码) {String} 01030712 请填写大件洗价格
*/
func (self *DeviceController) Create(ctx *iris.Context) {
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	var device model.Device
	ctx.ReadJSON(&device)
	if device.SerialNumber == "" {
		result = &enity.Result{"01030702", nil, device_msg["01030702"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if len(device.SerialNumber) != 10 {
		result = &enity.Result{"01030703", nil, device_msg["01030703"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.ProvinceId <= 0 {
		result = &enity.Result{"01030704", nil, device_msg["01030704"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.SchoolId <= 0 {
		result = &enity.Result{"01030705", nil, device_msg["01030705"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.Label == "" {
		result = &enity.Result{"01030706", nil, device_msg["01030706"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.ReferenceDeviceId <= 0 {
		result = &enity.Result{"01030707", nil, device_msg["01030707"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.FirstPulsePrice <= 0 {
		result = &enity.Result{"01030708", nil, device_msg["01030708"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.SecondPulsePrice <= 0 {
		result = &enity.Result{"01030709", nil, device_msg["01030709"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.ThirdPulsePrice <= 0 {
		result = &enity.Result{"01030710", nil, device_msg["01030710"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.FourthPulsePrice <= 0 {
		result = &enity.Result{"01030711", nil, device_msg["01030711"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	success := deviceService.Create(&device)
	if !success {
		result = &enity.Result{"01030701", nil, device_msg["01030701"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01030700", nil, device_msg["01030700"]}
	ctx.JSON(iris.StatusOK, result)
}

/**
 * @api {patch} /api/device/:id/pulse-name 更新设备脉冲名
 * @apiName UpdatePulseName
 * @apiGroup Device
 */
func (self *DeviceController) UpdatePulseName(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	var device model.Device
	ctx.ReadJSON(&device)
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	if id <= 0 {
		result = &enity.Result{"01030802", nil, device_msg["01030802"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	isFirstEmpty := strings.EqualFold(strings.Trim(device.FirstPulseName, " "), "")
	isSecondEmpty := strings.EqualFold(strings.Trim(device.SecondPulseName, " "), "")
	isThirdEmpty := strings.EqualFold(strings.Trim(device.ThirdPulseName, " "), "")
	isFourthEmpty := strings.EqualFold(strings.Trim(device.FourthPulseName, " "), "")
	if isFirstEmpty && isSecondEmpty && isThirdEmpty && isFourthEmpty {
		result = &enity.Result{"01030803", nil, device_msg["01030803"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	success := deviceService.UpdatePulseName(device)
	if !success {
		result = &enity.Result{"01030801", nil, device_msg["01030801"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01030800", nil, device_msg["01030800"]}
	ctx.JSON(iris.StatusOK, result)
}
