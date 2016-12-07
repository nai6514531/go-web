package controller

import (
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/service"
	"strings"
)

type DeviceController struct {
}

var (
	device_msg = map[string]string{

		"01030001": "该设备id不存在",
		"01030002": "请操作你自身、下级或Test账号下的设备",
		"01020003": "无该设备用户信息",

		"01030100": "拉取设备详情成功!",
		"01030101": "拉取设备详情失败!",

		"01030200": "更新设备状态成功!",
		"01030201": "更新设备状态失败!",
		"01030202": "设备id不能小于0!",
		"01030203": "设备状态不能小于0!",

		"01030300": "更新设备成功!",
		"01030301": "更新设备失败!",
		"01030302": "请输入10位设备编号!",
		"01030303": "设备编号格式不对,长度为10位!",
		"01030304": "请选择省份!",
		"01030305": "请选择学校!",
		"01030306": "请填写楼层信息!",
		"01030307": "请选择关联设备!",
		"01030308": "请填写单脱价格!",
		"01030309": "请填写快洗价格!",
		"01030310": "请填写标准洗价格!",
		"01030311": "请填写大件洗价格!",
		"01030312": "设备id不能小于0!",
		"01030313": "该设备序列号已经存在!",

		"01030400": "拉取设备列表成功!",
		"01030401": "拉取设备列表失败!",
		"01030402": "拉取设备学校信息失败!",

		"01030500": "更新设备成功!",
		"01030501": "批量更新设备失败!",
		"01030502": "请输入一个或多个10位设备编号,以回车分隔!",
		"01030503": "设备编号格式不对,长度为10位!",
		"01030504": "请选择省份!",
		"01030505": "请选择学校!",
		"01030506": "请填写楼层信息!",
		"01030507": "请选择关联设备!",
		"01030508": "新添加设备中包含已存在的设备，请检查!",
		"01030509": "请操作属于你或未被注册的设备!",
		"01030510": "请填写标准洗价格!",
		"01030511": "请填写大件洗价格!",
		"01030512": "你已经添加了该设备!",
		"01030513": "请操作你自身、下级或Test账号下的设备!",
		"01030514": "无该设备用户信息",

		"01030600": "重置设备成功!",
		"01030601": "重置设备失败!",
		"01030602": "设备id不能小于0!",
		"01030603": "该设备已被重置或不存在!",

		"01030700": "添加设备成功!",
		"01030701": "添加设备失败!",
		"01030702": "请输入一个或多个10位设备编号,以回车分隔!",
		"01030703": "设备编号格式不对,长度为10位!",
		"01030704": "请选择省份!",
		"01030705": "请选择学校!",
		"01030706": "请填写楼层信息!",
		"01030707": "请选择关联设备!",
		"01030708": "请填写单脱价格!",
		"01030709": "请填写快洗价格!",
		"01030710": "请填写标准洗价格!",
		"01030711": "请填写大件洗价格!",
		"01030712": "新添加设备中包含已存在的设备，请检查!",

		"01030800": "更新设备脉冲名成功!",
		"01030801": "更新设备脉冲名失败!",
		"01030802": "设备id不能小于0!",
		"01030803": "设备脉冲名不能为空!",

		"01030900": "删除设备成功!",
		"01030901": "删除设备失败!",
		"01030902": "设备id不能小于0!",
		"01030903": "该设备已被注册或不存在!",

		"01031000": "解除占用成功",
		"01031001": "解除占用失败",
		"01031002": "无该设备信息",
		"01031003": "当前用户无操作权限",

		"01031100": "拉取设备消费详情成功",
		"01031101": "拉取设备消费详情失败",

		"01031200": "所选设备分配成功",
		"01031201": "所选设备分配失败",
		"01031202": "被分配的用户账户不存在",
		"01031203": "获取被分配的设备信息异常",
		"01031204": "被分配的用户账户不能为空",
		"01031205": "被分配的设备不能为空",
		"01031206": "获取被分配的设备所有者信息异常",
		"01031207": "所选设备存在不合法数据，请检查所选设备是否为自有设备或已被分配",
	}
)

//中间件-判断操作的设备是否属于我,我的下级或者测试账号
func (self *DeviceController) OwnToMeOrTest(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id") //要操作的设备id
	result := &enity.Result{}
	userId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	//根据要操作的设备id查找
	deviceService := &service.DeviceService{}
	userService := &service.UserService{}
	device, err := deviceService.Basic(id)
	if err != nil {
		//如果没有找到条目不做处理
		result = &enity.Result{"01030001", err, device_msg["01030001"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	user, err := userService.Basic(device.UserId)
	if err != nil {
		result = &enity.Result{"01030003", nil, device_msg["01030003"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.UserId == userId || device.UserId == 1 || user.ParentId == userId {
		ctx.Next()
		return
	} else {
		result = &enity.Result{"01030002", nil, device_msg["01030002"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
}

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
		result = &enity.Result{"01030101", err, device_msg["01030101"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01030100", device, device_msg["01030100"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

/**
 	@api {get} /api/device 设备列表
 	@apiName List
	@apiGroup Device
 	@apiSuccessExample 成功返回
	{
	  "status": "01030400",
	  "data": {
	    "total": 4,
	    "list": [
	      {
	        "id": 7,
	        "createdAt": "2016-10-22T15:40:49+08:00",
	        "updatedAt": "2016-10-22T15:49:40+08:00",
	        "deletedAt": null,
	        "userId": 20,
	        "label": "一楼1",
	        "serialNumber": "1234567899",
	        "referenceDeviceId": 1,
	        "provinceId": 440000,
	        "cityId": 0,
	        "districtId": 0,
	        "schoolId": 12051,
	        "address": "",
	        "firstPulsePrice": 1110,
	        "secondPulsePrice": 20,
	        "thirdPulsePrice": 30,
	        "fourthPulsePrice": 40,
	        "firstPulseName": "maichong",
	        "secondPulseName": "",
	        "thirdPulseName": "",
	        "fourthPulseName": "",
	        "password": "",
	        "step": 0,
	        "status": 0
	      },...
	    ]
	  },
	  "msg": "拉取设备列表成功!"
	}
	@apiParam (错误码) {String} 01030401 拉取设备列表失败
*/
func (self *DeviceController) List(ctx *iris.Context) {
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("perPage")
	serialNumber := ctx.URLParam("serialNumber")
	userQuery := ctx.URLParam("userQuery")
	//_list := make([]*model.Device, 0)
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	userId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	userService := &service.UserService{}
	user, err:= userService.Basic(userId)
	if err != nil {
		result = &enity.Result{"01030401", err.Error(), device_msg["01030401"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	list, err := deviceService.ListByUserAndNextLevel(user, serialNumber, userQuery, page, perPage)
	if err != nil {
		result = &enity.Result{"01030401", err.Error(), device_msg["01030401"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	total, err := deviceService.TotalByUserAndNextLevel(user, serialNumber, userQuery)
	if err != nil {
		result = &enity.Result{"01030401", err.Error(), device_msg["01030401"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	for _, device := range *list {

		// 每个登录账户只拉取属于自己和由自己分配出去的设备，即user_id & from_user_id为当前登录的用户id的设备
		// 如果设备的userId等于当前登录的用户id，则表明此设备未分配，还属于当前账户
		if user.Id == device.UserId {
			device.HasAssigned = 0
			if user != nil {
				device.UserId = user.Id
				device.UserName = user.Name
				device.UserMobile = user.Mobile
			}
			fromUser, _ := userService.Basic(device.FromUserId)
			if fromUser != nil {
				device.FromUserId = fromUser.Id
				device.FromUserName = fromUser.Name
				device.FromUserMobile = fromUser.Mobile
			}
		} else {
			device.HasAssigned = 1
			if user != nil {
				device.FromUserId = user.Id
				device.FromUserName = user.Name
				device.FromUserMobile = user.Mobile
			}
			toUser, _ := userService.Basic(device.UserId)
			if toUser != nil {
				device.UserId = toUser.Id
				device.UserName = toUser.Name
				device.UserMobile = toUser.Mobile
			}
		}
	}
	result = &enity.Result{"01030400", &enity.Pagination{total, list}, device_msg["01030400"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

/**
  	@api {patch} /api/device/:id/status 更新设备状态
  	@apiName UpdateStatus
  	@apiGroup Device
 	@apiParamExample {json} 请求例子:
	{
	  "status":1
	}
	@apiSuccessExample 成功返回:
	{
	  "status": "01030200",
	  "data": null,
	  "msg": "更新设备状态成功!"
	}
**/
func (self *DeviceController) UpdateStatus(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	var device model.Device
	ctx.ReadJSON(&device)
	if id <= 0 {
		result = &enity.Result{"01030202", nil, device_msg["01030202"]}
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
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01030200", nil, device_msg["01030200"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

func (self *DeviceController) UnLock(ctx *iris.Context) {
	serialNum := ctx.URLParam("serial-number")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	/*userId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	if userId != 4 || userId != 5 || userId != 368 || userId != 465 || userId != 1140 {
		result = &enity.Result{"01031003", nil, device_msg["01031003"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}*/
	device, err := deviceService.BasicBySerialNumber(serialNum)
	if err != nil {
		result = &enity.Result{"01031002", err.Error(), device_msg["01031002"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	device.Status = 0
	boo := deviceService.UpdateStatus(*device)
	if !boo {
		result = &enity.Result{"01031001", nil, device_msg["01031001"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01031000", nil, device_msg["01031000"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *DeviceController) DailyBill(ctx *iris.Context) {
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("perPage")
	//userId, _ := ctx.URLParamInt("userId")
	billAt := ctx.URLParam("billAt")
	serialNumber := ctx.Param("serialNumber")
	list, err := deviceService.DailyBill(serialNumber, billAt, page, perPage)
	if err != nil {
		result = &enity.Result{"01031101", err.Error(), device_msg["01031101"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01031100", list, device_msg["01031100"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

/**
	@api {put} /api/device/:id 更新设备
	@apiName Update
 	@apiGroup Device
  	@apiParamExample {json} 请求例子:
	{
		"serialNumber":"1234567890",
		"provinceId":440000,
		"schoolId":12051,
		"label":"一楼",
		"referenceDeviceId":1,
		"firstPulsePrice":10,
		"secondPulsePrice":20,
		"thirdPulsePrice":30,
		"fourthPulsePrice":40
	}
	@apiSuccessExample 成功返回:
	{
  		"status": "01030300",
  		"data": null,
  		"msg": "更新设备成功!"
	}
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
	if device.SchoolId < 0 {
		result = &enity.Result{"01030305", nil, device_msg["01030305"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	// if device.Label == "" {
	// 	result = &enity.Result{"01030306", nil, device_msg["01030306"]}
	// 	ctx.JSON(iris.StatusOK, result)
	// 	return
	// }
	if device.ReferenceDeviceId <= 0 {
		result = &enity.Result{"01030307", nil, device_msg["01030307"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	// if device.FirstPulsePrice <= 0 {
	// 	result = &enity.Result{"01030308", nil, device_msg["01030308"]}
	// 	ctx.JSON(iris.StatusOK, result)
	// 	return
	// }
	// if device.SecondPulsePrice <= 0 {
	// 	result = &enity.Result{"01030309", nil, device_msg["01030309"]}
	// 	ctx.JSON(iris.StatusOK, result)
	// 	return
	// }
	// if device.ThirdPulsePrice <= 0 {
	// 	result = &enity.Result{"01030310", nil, device_msg["01030310"]}
	// 	ctx.JSON(iris.StatusOK, result)
	// 	return
	// }
	// if device.FourthPulsePrice <= 0 {
	// 	result = &enity.Result{"01030311", nil, device_msg["01030311"]}
	// 	ctx.JSON(iris.StatusOK, result)
	// 	return
	// }
	//判断序列号名是否已经被使用了
	currentDevice, _ := deviceService.BasicBySerialNumber(device.SerialNumber)
	if (currentDevice != nil) && (currentDevice.Id != id) {
		//可以找到并且不为当前要修改的记录
		result = &enity.Result{"01030313", nil, device_msg["01030313"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	device.Id = id
	success := deviceService.Update(device)
	if !success {
		result = &enity.Result{"01030301", nil, device_msg["01030301"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01030300", nil, device_msg["01030300"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

/**
 	@api {put} /api/device/:id/serial-number 通过编号更新设备
	@apiName UpdateBySerialNumber
	@apiGroup Device
   	@apiParamExample {json} 请求例子:
 	{
		"serialNumber":"1234567890",
		"provinceId":440000,
		"schoolId":12051,
		"label":"一楼",
		"referenceDeviceId":1,
		"firstPulsePrice":10,
		"secondPulsePrice":20,
		"thirdPulsePrice":30,
		"fourthPulsePrice":40
	}
	@apiSuccessExample 成功返回:
	{
  		"status": "01030500",
  		"data": null,
  		"msg": "更新设备成功!"
	}
*/
func (self *DeviceController) UpdateBySerialNumber(ctx *iris.Context) {
	deviceService := &service.DeviceService{}
	userService := &service.UserService{}
	result := &enity.Result{}
	var device model.Device
	ctx.ReadJSON(&device)
	if device.SerialNumber == "" {
		result = &enity.Result{"01030502", nil, device_msg["01030502"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	serialList := strings.Split(device.SerialNumber, ",")
	for _, v := range serialList {
		if len(v) != 10 {
			//必须为10位的
			result = &enity.Result{"01030503", nil, device_msg["01030503"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
	}

	if device.ProvinceId <= 0 {
		result = &enity.Result{"01030504", nil, device_msg["01030504"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.SchoolId < 0 {
		result = &enity.Result{"01030505", nil, device_msg["01030505"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.ReferenceDeviceId <= 0 {
		result = &enity.Result{"01030507", nil, device_msg["01030507"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//修改设备的用户为当前用户id
	sessionUserId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	user, err := userService.Basic(device.UserId)
	if err != nil {
		result = &enity.Result{"01030514", err.Error(), device_msg["01030514"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if sessionUserId != device.UserId && sessionUserId != user.ParentId && sessionUserId != 1 {
		result = &enity.Result{"01030513", nil, device_msg["01030513"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//判断一下这批设备的用户id是否为1或者自己
	isOwntoMeOrTest := deviceService.IsOwntoMeOrTest(device.UserId, serialList)
	if !isOwntoMeOrTest {
		result = &enity.Result{"01030508", nil, device_msg["01030508"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	common.Logger.Debugln("device.UserId===========", device.UserId)
	//device.UserId = userId
	success := deviceService.BatchUpdateBySerialNumber(&device, serialList)
	if !success {
		result = &enity.Result{"01030501", nil, device_msg["01030501"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01030500", nil, device_msg["01030500"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

/**
	@api {patch} /api/device/:id/reset 重置设备
 	@apiName Reset
	@apiGroup Device
 	@apiSuccessExample 成功返回:
	{
  		"status": "01030600",
  		"data": null,
  		"msg": "重置设备成功!"
	}
*/
//事实上是重置设备，将userid变回1
func (self *DeviceController) Reset(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	if id <= 0 {
		result = &enity.Result{"01030602", nil, device_msg["01030602"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	currentDevice, err := deviceService.Basic(id)
	if err != nil {
		result = &enity.Result{"01030601", err, device_msg["01030601"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	if currentDevice == nil || currentDevice.UserId == 1 {
		//设备被重置了或不存在
		result = &enity.Result{"01030603", nil, device_msg["01030603"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	userService := &service.UserService{}
	userId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	user, _ := userService.Basic(userId)
	success := deviceService.Reset(id, user)
	if !success {
		result = &enity.Result{"01030601", nil, device_msg["01030601"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	result = &enity.Result{"01030600", nil, device_msg["01030600"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

/**
	@api {patch} /api/device/:id 删除设备
 	@apiName Delete
	@apiGroup Device
 	@apiSuccessExample 成功返回:
	{
  		"status": "01030600",
  		"data": null,
  		"msg": "重置设备成功!"
	}
*/
//硬删除
func (self *DeviceController) Delete(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	if id <= 0 {
		result = &enity.Result{"01030902", nil, device_msg["01030902"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	currentDevice, err := deviceService.Basic(id)
	if err != nil {
		result = &enity.Result{"01030901", err, device_msg["01030901"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return

	}
	if currentDevice == nil || currentDevice.UserId != 1 {
		//设备正在使用了或不存在
		result = &enity.Result{"01030903", nil, device_msg["01030903"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	success := deviceService.Delete(id)
	if !success {
		result = &enity.Result{"01030901", nil, device_msg["01030901"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	result = &enity.Result{"01030900", nil, device_msg["01030900"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
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
	serialList := strings.Split(device.SerialNumber, ",")
	for _, v := range serialList {
		if len(v) != 10 {
			//必须为10位的
			result = &enity.Result{"01030703", nil, device_msg["01030703"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
	}

	if device.ProvinceId <= 0 {
		result = &enity.Result{"01030704", nil, device_msg["01030704"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if device.SchoolId < 0 {
		result = &enity.Result{"01030705", nil, device_msg["01030705"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}

	if device.ReferenceDeviceId <= 0 {
		result = &enity.Result{"01030707", nil, device_msg["01030707"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}

	//判断该序列号列表是否全部要不还不存在要不属于test用户的
	isNoExist := deviceService.IsNoExist(serialList)
	if !isNoExist {
		result = &enity.Result{"01030712", nil, device_msg["01030712"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//userId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	device.UserId = 1
	err := deviceService.BatchCreateBySerialNum(&device, serialList)
	if err != nil {
		result = &enity.Result{"01030701", nil, device_msg["01030701"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	result = &enity.Result{"01030700", nil, device_msg["01030700"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

/**
	@api {patch} /api/device/:id/pulse-name 更新设备脉冲名
	@apiName UpdatePulseName
	@apiGroup Device
  	@apiParamExample {json} 请求例子:
	{
	  "firstPulseName":"单洗价格"
	  "SecondPulseName":"xxx"
	  ...
	}
	@apiSuccessExample 成功返回:
 	HTTP/1.1 200 OK
	{
		"status": "01030800",
		"data": null,
		"msg": "更新设备脉冲名成功!"
	}
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
	device.Id = id
	success := deviceService.UpdatePulseName(device)
	if !success {
		result = &enity.Result{"01030801", nil, device_msg["01030801"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	result = &enity.Result{"01030800", nil, device_msg["01030800"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

func (self *DeviceController) Assign(ctx *iris.Context) {
	type AssignData struct {
		UserAccount   string `json:"userAccount"`
		SerialNumbers string `json:"serialNumbers"`
	}
	var assignData AssignData
	ctx.ReadJSON(&assignData)
	result := &enity.Result{}
	if assignData.UserAccount == "" {
		result = &enity.Result{"01031204", nil, device_msg["01031204"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if assignData.SerialNumbers == "" {
		result = &enity.Result{"01031205", nil, device_msg["01031205"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	userService := &service.UserService{}
	toUser, err := userService.FindByAccount(assignData.UserAccount)
	if err != nil || toUser == nil {
		result = &enity.Result{"01031202", err.Error(), device_msg["01031202"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	deviceService := &service.DeviceService{}
	serialNumberList := strings.Split(assignData.SerialNumbers, ",")
	//serialNumbers := assignData.SerialNumbers
	sessionUserId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))

	devices, err := deviceService.ListByUserAndSerialNumbers(sessionUserId, serialNumberList)
	if err != nil {
		result = &enity.Result{"01031203", err.Error(), device_msg["01031203"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if len(*devices) != len(serialNumberList) {
		result = &enity.Result{"01031207", nil, device_msg["01031207"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	fromUser, err := userService.Basic(sessionUserId)
	if err != nil || fromUser == nil {
		result = &enity.Result{"01031206", err.Error(), device_msg["01031206"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	success, err := deviceService.Assign(toUser, fromUser, serialNumberList)
	if !success || err != nil {
		result = &enity.Result{"01031201", err.Error(), device_msg["01031201"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01031200", nil, device_msg["01031200"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)

}
