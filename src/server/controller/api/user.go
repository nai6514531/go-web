package controller

import (
	"fmt"
	"github.com/bitly/go-simplejson"
	"github.com/kataras/iris"
	"github.com/mitchellh/mapstructure"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/service"
)

/**
 	@api {All} /api/<%=?%> 状态码
	@apiGroup User
	@apiName Status
	@apiParam (错误码) {String} 01010100 登录成功
	@apiParam (错误码) {String} 01010101 账号不能为空
	@apiParam (错误码) {String} 01010102 密码不能为空
	@apiParam (错误码) {String} 01010103 图片验证码不能为空
	@apiParam (错误码) {String} 01010104 图片验证码已过期
	@apiParam (错误码) {String} 01010105 图片验证码错误
	@apiParam (错误码) {String} 01010109 账号不存在
	@apiParam (错误码) {String} 01010110 密码错误

	@apiParam (错误码) {String} 00100200 注销成功

	@apiParam (错误码) {String} 01010400 添加用户记录成功
	@apiParam (错误码) {String} 01010401 登陆账号不能为空
	@apiParam (错误码) {String} 01010402 名称不能为空
	@apiParam (错误码) {String} 01010403 联系人不能为空
	@apiParam (错误码) {String} 01010404 密码不能为空
	@apiParam (错误码) {String} 01010406 联系人手机不能为空
	@apiParam (错误码) {String} 01010407 登陆账号已被注册
	@apiParam (错误码) {String} 01010408 请填写正确的type值1-支付宝(实时分账)，2-微信,3-银行
	@apiParam (错误码) {String} 01010409 结算账号不能为空
	@apiParam (错误码) {String} 01010410 新增用户记录失败
	@apiParam (错误码) {String} 01010411 新增用户结算账号失败
	@apiParam (错误码) {String} 01010412 新增用户角色记录失败
	@apiParam (错误码) {String} 01010413 手机号已被使用
	@apiParam (错误码) {String} 01010414 请输入11位的手机号

	@apiParam (错误码) {String} 01010500 修改用户记录成功
	@apiParam (错误码) {String} 01010501 登陆账号不能为空
	@apiParam (错误码) {String} 01010502 名称不能为空
	@apiParam (错误码) {String} 01010503 联系人不能为空
	@apiParam (错误码) {String} 01010504 密码不能为空
	@apiParam (错误码) {String} 01010506 联系人手机不能为空
	@apiParam (错误码) {String} 01010507 登陆账号已被注册
	@apiParam (错误码) {String} 01010508 手机号码已被使用
	@apiParam (错误码) {String} 01010509 请填写正确的type值1-支付宝(实时分账)，2-微信,3-银行!
	@apiParam (错误码) {String} 01010510 结算账号不能为空
	@apiParam (错误码) {String} 01010511 修改用户记录失败
	@apiParam (错误码) {String} 01010512 修改用户结算账号失败
	@apiParam (错误码) {String} 01010513 请输入11位的手机号

	@apiParam (错误码) {String} 01010600 拉取用户详情成功
	@apiParam (错误码) {String} 01010601 拉取用户详情失败

	@apiParam (错误码) {String} 01010700 拉取用户列表成功
	@apiParam (错误码) {String} 01010701 拉取用户列表失败
	@apiParam (错误码) {String} 01010702 拉取用户总数失败

	@apiParam (错误码) {String} 01010800 获取用户详情含设备数成功
	@apiParam (错误码) {String} 01010801 获取用户详情含设备数失败

	@apiParam (错误码) {String} 01010900 拉取用户设备列表成功
	@apiParam (错误码) {String} 01010901 拉取用户设备列表失败

	@apiParam (错误码) {String} 01011000 拉取用户指定学校设备列表成功
	@apiParam (错误码) {String} 01011001 拉取用户指定学校设备列表失败

	@apiParam (错误码) {String} 01011100 拉取用户学校列表成功
	@apiParam (错误码) {String} 01011101 拉取用户学校列表失败
	@apiParam (错误码) {String} 01011102 该学校id不存在

	@apiParam (错误码) {String} 01011200 拉取用户菜单列表成功
	@apiParam (错误码) {String} 01011201 拉取用户菜单列表失败

	@apiParam (错误码) {String} 01011300 拉取用户权限列表成功
	@apiParam (错误码) {String} 01011301 拉取用户权限列表失败

	@apiSuccessExample {json} 响应体:
		HTTP/1.1 200 OK
		{
		 	"status": "",
		 	"data": {},
 			"msg": ""
		}
**/
type UserController struct {
}

var (
	user_msg = map[string]string{

		"01010100": "登录成功",
		"01010101": "账号不能为空",
		"01010102": "密码不能为空",
		"01010103": "图片验证码不能为空",
		"01010104": "图片验证码已过期",
		"01010105": "图片验证码错误",
		"01010109": "账号不存在",
		"01010110": "密码错误",

		"00100200": "注销成功",

		"01010400": "添加用户记录成功!",
		"01010401": "登陆账号不能为空!",
		"01010402": "名称不能为空!",
		"01010403": "联系人不能为空!",
		"01010404": "密码不能为空!",
		"01010406": "联系人手机不能为空!",
		"01010407": "登陆账号已被注册!",
		"01010408": "请填写正确的type值1-支付宝(实时分账)，2-微信,3-银行!",
		"01010409": "结算账号不能为空",
		"01010410": "新增用户记录失败",
		"01010411": "新增用户结算账号失败",
		"01010412": "新增用户角色记录失败",
		"01010413": "手机号已被使用",
		"01010414": "请输入11位的手机号!",

		"01010500": "修改用户记录成功!",
		"01010501": "登陆账号不能为空!",
		"01010502": "名称不能为空!",
		"01010503": "联系人不能为空!",
		"01010504": "密码不能为空!",
		"01010506": "联系人手机不能为空!",
		"01010507": "登陆账号已被注册!",
		"01010508": "手机号码已被使用!",
		"01010509": "请填写正确的type值1-支付宝(实时分账)，2-微信,3-银行!",
		"01010510": "结算账号不能为空",
		"01010511": "修改用户记录失败",
		"01010512": "修改用户结算账号失败",
		"01010513": "请输入11位的手机号!",

		"01010600": "拉取用户详情成功!",
		"01010601": "拉取用户详情失败!",
		"01010602": "该用户不存在!",

		"01010700": "拉取用户列表成功!",
		"01010701": "拉取用户列表失败!",
		"01010702": "拉取用户总数失败!",

		"01010800": "获取用户详情含设备数成功!",
		"01010801": "获取用户详情含设备数失败!",

		"01010900": "拉取用户设备列表成功!",
		"01010901": "拉取用户设备列表失败!",

		"01011000": "拉取用户指定学校设备列表成功!",
		"01011001": "拉取用户指定学校设备列表失败!",

		"01011100": "拉取用户学校列表成功!",
		"01011101": "拉取用户学校列表失败!",
		"01011102": "该学校id不存在!",

		"01011200": "拉取用户菜单列表成功!",
		"01011201": "拉取用户菜单列表失败!",

		"01011300": "拉取用户权限列表成功!",
		"01011301": "拉取用户权限列表失败!",
	}
)

func (self *UserController) SignInUser(ctx *iris.Context) {
	userService := &service.UserService{}
	result := &enity.Result{}
	list, err := userService.ListOfSignIn()
	if err != nil {
		result = &enity.Result{"1", nil, "拉取注册用户数据异常"}
	} else {
		result = &enity.Result{"0", list, "拉取注册用户数据成功"}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
	@api {post} /api/signin 用户登陆
	@apiName Signin
	@apiGroup User
	@apiParamExample 发送请求:
	{
		"account":"18023380466",
 		"password":"e10adc3949ba59abbe56e057f20f883e",
 		"verificode":"056639",
 		"captcha":"123456"
	}
	@apiSuccessExample Success-Response:
	HTTP/1.1 200 OK
	{
		"status": "01010100",
		"data": {
		    "id": 20,
		    "createdAt": "2016-10-22T11:01:18+08:00",
		    "updatedAt": "2016-10-22T11:10:08+08:00",
		    "deletedAt": null,
		    "name": "卖座网",
		    "contact": "mainland",
		    "address": "科技园",
		    "mobile": "18023380461",
		    "account": "soda",
		    "password": "e10adc3949ba59abbe56e057f20f883e",
		    "telephone": "0766-2885417",
		    "email": "317808023@qq.com",
		    "parentId": 20,
		    "gender": 0,
		    "age": 0,
		    "status": 0
		},
		"msg": "登录成功"
	}
*/
func (self *UserController) Signin(ctx *iris.Context) {
	//每次调用返回时都清一次图片验证码
	var returnCleanCaptcha = func(re *enity.Result) {
		ctx.Session().Delete(viper.GetString("server.captcha.key"))
		ctx.JSON(iris.StatusOK, re)
	}

	/*获取请求参数*/
	body := simplejson.New()
	ctx.ReadJSON(body)
	account, _ := body.Get("account").String()
	password, _ := body.Get("password").String()
	captcha, _ := body.Get("captcha").String()

	/*判断不能为空*/
	if account == "" {
		result := &enity.Result{"01010101", nil, user_msg["01010101"]}
		returnCleanCaptcha(result)
		return
	}
	if password == "" {
		result := &enity.Result{"01010102", nil, user_msg["01010102"]}
		returnCleanCaptcha(result)
		return
	}
	if captcha == "" {
		result := &enity.Result{"01010103", nil, user_msg["01010103"]}
		returnCleanCaptcha(result)
		return
	}

	captchaKey := viper.GetString("server.captcha.Key")
	captchaCache := ctx.Session().GetString(captchaKey)
	if captchaCache == "" {
		//不存在
		result := &enity.Result{"01010104", nil, user_msg["01010104"]}
		returnCleanCaptcha(result)
		return
	}
	/*图片验证码错误*/
	if captchaCache != captcha {
		result := &enity.Result{"01010105", nil, user_msg["01010105"]}
		returnCleanCaptcha(result)
		return
	}
	/*账号不存在*/
	userService := &service.UserService{}
	user, err := userService.FindByAccount(account)
	if err != nil {
		result := &enity.Result{"01010109", nil, user_msg["01010109"]}
		returnCleanCaptcha(result)
		return
	}

	/*登陆密码错误*/
	if user.Password != password {
		result := &enity.Result{"01010110", nil, user_msg["01010110"]}
		returnCleanCaptcha(result)
		return
	}

	/*登陆成功*/
	ctx.Session().Set(viper.GetString("server.session.user.id"), user.Id)

	result := &enity.Result{"01010100", user, user_msg["01010100"]}
	returnCleanCaptcha(result)
}

/**
	@api {post} /api/signout 用户注销
	@apiName Signout
	@apiGroup User
	@apiSuccessExample Success-Response:
	HTTP/1.1 200 OK
	{
		"status": "00100200",
		"data": null,
		"msg": "注销成功"
	}
**/
func (self *UserController) Signout(ctx *iris.Context) {
	ctx.SessionDestroy()
	result := &enity.Result{"00100200", nil, user_msg["00100200"]}
	ctx.JSON(iris.StatusOK, &result)
}

/**
	@api {post} /api/user 新建一个用户
	@apiName Create
	@apiGroup User
	@apiSuccessExample Success-Response:
	HTTP/1.1 200 OK
	{
		"status": "01010400",
		"data": null,
		"msg": "添加用户记录成功!"
	}
	@apiParamExample {json} 请求例子:
	{
	    "account":"wumingyu",
	    "name":"卖座网",
	    "contact":"mainland",
	    "mobile":"18023380461116",
	    "telephone":"0766-2885411",
	    "email":"317808023@qq.com",
		"cashAccount":{
		    "type":1,
		    "realName":"伍明煜",
		    "bankName":"中国银行",
		    "account":"44444441200001111",
		    "mobile":"18023380455",
		    "cityId":3333,
		    "provinceId":2222
		}
	}
**/
func (self *UserController) Create(ctx *iris.Context) {
	/*获取请求参数*/
	var user model.User
	userService := &service.UserService{}
	userCashAccountService := &service.UserCashAccountService{}
	result := &enity.Result{}
	ctx.ReadJSON(&user)

	//user信息校验
	if user.Account == "" {
		result = &enity.Result{"01010401", nil, user_msg["01010401"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if user.Name == "" {
		result = &enity.Result{"01010402", nil, user_msg["01010402"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if user.Contact == "" {
		result = &enity.Result{"01010403", nil, user_msg["01010403"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if user.Mobile == "" {
		result = &enity.Result{"01010406", nil, user_msg["01010406"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//判断手机号是否为11位
	if len(user.Mobile) != 11 {
		result = &enity.Result{"01010414", nil, user_msg["01010414"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//判断登陆名是否已经存在
	currentUser, _ := userService.FindByAccount(user.Account)
	if currentUser != nil {
		//可以找到
		result = &enity.Result{"01010407", nil, user_msg["01010407"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//判断手机号是否存在
	currentUser, _ = userService.FindByMobile(user.Mobile)
	if currentUser != nil {
		result = &enity.Result{"01010413", nil, user_msg["01010413"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//获取cashAccount
	cashAccount := &model.UserCashAccount{}
	mapstructure.Decode(user.CashAccount, cashAccount)
	//cash内容判断
	// if (cashAccount.Type != 1) && (cashAccount.Type != 2) && (cashAccount.Type != 3) {
	// 	//1-实时分账(支付宝)，2-微信 3-银行
	// 	result = &enity.Result{"01010408", nil, user_msg["01010408"]}
	// 	ctx.JSON(iris.StatusOK, result)
	// 	return
	// }
	if cashAccount.Account == "" {
		result = &enity.Result{"01010409", nil, user_msg["01010409"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}

	//插入user到user表
	user.ParentId = ctx.Session().GetInt(viper.GetString("server.session.user.id")) //设置session userId作为parentid
	user.Password = "123456"                                                        //设置密码为123456
	ok := userService.Create(&user)
	if !ok {
		result = &enity.Result{"01010410", nil, user_msg["01010410"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//插入结算账号信息
	userNew, _ := userService.FindByAccount(user.Account) //得到新插入的条目
	cashAccount.UserId = userNew.Id                       //cash记录的userid设置为新插入条目的id
	ok = userCashAccountService.Create(cashAccount)
	if !ok {
		result = &enity.Result{"01010411", nil, user_msg["01010411"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//插入一条用户角色记录（暂时所有调用此的api都是代理商角色）
	userRoleRel := &model.UserRoleRel{}
	userRoleRel.UserId = user.Id
	userRoleRel.RoleId = 2 //统一为用户角色
	userRoleRelSevice := &service.UserRoleRelService{}
	ok = userRoleRelSevice.Create(userRoleRel)
	if !ok {
		result = &enity.Result{"01010412", nil, user_msg["01010412"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}

	result = &enity.Result{"01010400", nil, user_msg["01010400"]}
	ctx.JSON(iris.StatusOK, &result)
}

/**
	@api {put} /api/user/:id 更新一个用户
	@apiName Update
	@apiGroup User
	@apiSuccessExample Success-Response:
   	HTTP/1.1 200 OK
	{
	  "status": "01010500",
	  "data": null,
	  "msg": "更新用户记录成功!"
	}
	@apiParamExample {json} 请求例子:
	{
	    "account":"wumingyu",
	    "name":"卖座网",
	    "contact":"mainland",
	    "mobile":"18023380461116",
	    "telephone":"0766-2885411",
	    "email":"317808023@qq.com",
		"cashAccount":{
		    "type":1,
		    "realName":"伍明煜",
		    "bankName":"中国银行",
		    "account":"44444441200001111",
		    "mobile":"18023380455",
		    "cityId":3333,
		    "provinceId":2222
		}
	}
*/
func (self *UserController) Update(ctx *iris.Context) {
	/*获取请求参数*/
	var user model.User
	userId, _ := ctx.ParamInt("id")
	//parentId = ctx.Session().GetInt(viper.GetString("server.session.user.id")) //设置session userId作为parentid
	userService := &service.UserService{}
	userCashAccountService := &service.UserCashAccountService{}
	result := &enity.Result{}
	ctx.ReadJSON(&user)
	user.Id = userId
	//user信息校验
	//判断登陆名是否已经存在
	if user.Account != "" { //如果有登陆账号传入
		currentUser, _ := userService.FindByAccount(user.Account)
		if (currentUser != nil) && (currentUser.Id != userId) {
			//可以找到,并且不为将要修改的那一条记录
			result = &enity.Result{"01010507", nil, user_msg["01010507"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
	}
	//判断手机号码是否已经存在
	if user.Mobile != "" {
		//判断手机号是否为11位
		if len(user.Mobile) != 11 {
			result = &enity.Result{"01010513", nil, user_msg["01010513"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		//判断手机号是否已被别人使用
		currentUser, _ := userService.FindByMobile(user.Mobile)
		if (currentUser != nil) && (currentUser.Id != userId) {
			//可以找到,并且不为将要修改的那一条记录
			result = &enity.Result{"01010508", nil, user_msg["01010508"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
	}

	//cashAccount
	cashAccount := &model.UserCashAccount{}
	mapstructure.Decode(user.CashAccount, cashAccount)
	cashAccount.UserId = userId
	fmt.Println(cashAccount)
	// //cash内容判断
	// if (cashAccount.Type != 1) && (cashAccount.Type != 2) && (cashAccount.Type != 3) {
	// 	//1-实时分账，2-财务结算
	// 	result = &enity.Result{"01010509", nil, user_msg["01010509"]}
	// 	ctx.JSON(iris.StatusOK, result)
	// 	return
	// }
	if cashAccount.Account == "" {
		result = &enity.Result{"01010510", nil, user_msg["01010510"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}

	//更新到user表
	ok := userService.Update(&user)
	if !ok {
		result = &enity.Result{"01010511", nil, user_msg["01010511"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//更新结算账号信息
	ok = userCashAccountService.UpdateByUserId(cashAccount)
	if !ok {
		result = &enity.Result{"01010512", nil, user_msg["01010512"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01010500", nil, user_msg["01010500"]}
	ctx.JSON(iris.StatusOK, &result)
}

/**
	@api {get} /api/user/:id 用户详情
	@apiName Detail
	@apiGroup User
	@apiSuccessExample Success-Response:
	HTTP/1.1 200 OK
	{
		"status": "01010600",
		"data": {
		    "id": 1,
		    "createdAt": "2016-10-17T16:21:10+08:00",
		    "updatedAt": "2016-10-10T22:51:25+08:00",
		    "deletedAt": null,
		    "name": "系统管理员",
		    "contact": "",
		    "address": "",
		    "mobile": "",
		    "account": "admin",
		    "password": "e10adc3949ba59abbe56e057f20f883e",
		    "telephone": "",
		    "email": "",
		    "parentId": 1,
		    "gender": 0,
		    "age": 0,
		    "status": 0,
		    "cashAccount": {
			    "id": 626,
			    "createdAt": "2016-10-13T13:34:48+08:00",
			    "updatedAt": "2016-10-13T13:34:48+08:00",
			    "deletedAt": null,
			    "userId": 1,
			    "type": 1,
			    "realName": "",
			    "bankName": "",
			    "account": "",
			    "mobile": "",
			    "cityId": 0,
			    "provinceId": 0
		    }
	    },
	  	"msg": "拉取用户详情成功!"
	}
**/
func (self *UserController) Basic(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	userService := &service.UserService{}
	result := &enity.Result{}
	user, err := userService.Basic(id)
	if err != nil {
		result = &enity.Result{"01010602", nil, user_msg["01010602"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	userCashAccountService := &service.UserCashAccountService{}
	cashAccount, _ := userCashAccountService.BasicByUserId(id)
	user.CashAccount = cashAccount
	deviceTotal, _ := userService.TotalOfDevice(id)
	user.DeviceTotal = deviceTotal
	if err != nil {
		result = &enity.Result{"01010601", nil, user_msg["01010601"]}
	} else {
		result = &enity.Result{"01010600", user, user_msg["01010600"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
	@api {get} /api/user?page=xxx&per_page=xxx 子用户列表
	@apiName ListByParent
	@apiGroup User
 	@apiSuccessExample Success-Response:
   	HTTP/1.1 200 OK
	{
		"status": "01010700",
		"data": {
			"total": 21,
			"list": [
				{
			        "id": 348,
			        "createdAt": "2016-10-22T16:20:15+08:00",
			        "updatedAt": "2016-10-22T16:19:15+08:00",
			        "deletedAt": null,
			        "name": "卖座网",
			        "contact": "mainland",
			        "address": "shenz深圳",
			        "mobile": "12345678901",
			        "account": "12345678901",
			        "password": "e10adc3949ba59abbe56e057f20f883e",
			        "telephone": "0766-2885411",
			        "email": "317808023@qq.com",
			        "parentId": 20,
			        "gender": 0,
			        "age": 0,
			        "status": 0
		      	},...
		    ]
	  	}
	  	"msg": "拉取用户列表成功!"
	}
*/
func (self *UserController) ListByParent(ctx *iris.Context) {
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("perPage")
	userId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	userService := &service.UserService{}
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	list, err := userService.SubList(userId, page, perPage)
	if err != nil {
		result = &enity.Result{"01010701", nil, user_msg["01010701"]}
	}
	total, err := userService.TotalByParentId(userId)
	if err != nil {
		result = &enity.Result{"01010702", nil, user_msg["01010702"]}
	}
	for _, user := range *list {
		userIds, _ := userService.SubChildIdsByUserId(user.Id) //获取所有子子。。用户id列表
		userIds = append(userIds, user.Id)                     //把自己也加上
		deviceTotal, _ := deviceService.TotalByUserIds(userIds)
		user.DeviceTotal = deviceTotal
	}
	result = &enity.Result{"01010700", &enity.Pagination{total, list}, user_msg["01010700"]}
	ctx.JSON(iris.StatusOK, result)
}

/**
	@api {get} /api/user/:id/device-total 用户详情(含设备总数)
	@apiName BasicWithDeviceInfo
	@apiGroup User
 	@apiSuccessExample Success-Response:
  	HTTP/1.1 200 OK
	{
		"status": "01010800",
	  	"data": {
		    "id": 20,
		    "createdAt": "2016-10-20T11:05:04+08:00",
		    "updatedAt": "2016-10-20T10:59:56+08:00",
		    "deletedAt": null,
		    "name": "卖座网",
		    "contact": "mainland",
		    "address": "科技园",
		    "mobile": "18023380461",
		    "account": "soda",
		    "password": "e10adc3949ba59abbe56e057f20f883e",
		    "telephone": "0766-2885412",
		    "email": "317808023@qq.com",
		    "parentId": 20,
		    "gender": 0,
		    "age": 0,
		    "status": 0,
		    "deviceTotal": 2
	  	},
	  	"msg": "获取用户详情含设备数成功!"
	}
*/
func (self *UserController) BasicWithDeviceTotal(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	userService := &service.UserService{}
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	user, err := userService.Basic(id)
	if err != nil {
		result = &enity.Result{"01010801", nil, user_msg["01010801"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//带上总设备数的信息
	var ids []int
	ids = append(ids, id)                              //把自己也算上
	childIds, _ := userService.SubChildIdsByUserId(id) //计算该用户下面的所有子子。。用户列表
	if childIds != nil {
		ids = append(ids, childIds...)
	}
	deviceTotal, _ := deviceService.TotalByUserIds(ids) //根据userid列表算出设备总数
	user.DeviceTotal = deviceTotal
	//返回
	result = &enity.Result{"01010800", user, user_msg["01010800"]}
	ctx.JSON(iris.StatusOK, result)
}

/**
 	@api {get} /api/user/:id/device 用户设备列表
 	@apiName DeviceList
 	@apiGroup User
	@apiSuccessExample Success-Response:
	HTTP/1.1 200 OK
	{
		"status": "01010900",
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
	  "msg": "拉取用户设备列表成功!"
	}
*/
func (self *UserController) DeviceList(ctx *iris.Context) {
	userId, _ := ctx.ParamInt("id")
	deviceService := &service.DeviceService{}
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("perPage")
	result := &enity.Result{}
	list, err := deviceService.ListByUser(userId, page, perPage)
	total, _ := deviceService.TotalByUser(userId)
	if err != nil {
		result = &enity.Result{"01010901", nil, user_msg["01010901"]}
	} else {
		result = &enity.Result{"01010900", &enity.Pagination{total, list}, user_msg["01010900"]}

	}
	ctx.JSON(iris.StatusOK, result)
}

/**
	@api {get} /api/user/:id/school/:schoolId/device 用户指定学校设备列表
	@apiName DeviceOfSchool
	@apiGroup User
	@apiSuccessExample Success-Response:
	{
		"status": "01011000",
		"data": {
	    	"total": 3,
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
	  	"msg": "拉取用户指定学校设备列表成功!"
	}
**/
func (self *UserController) DeviceOfSchool(ctx *iris.Context) {
	userId, _ := ctx.ParamInt("id")
	schoolId, _ := ctx.ParamInt("schoolId")
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("perPage")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	list, err := deviceService.ListByUserAndSchool(userId, schoolId, page, perPage)
	total, _ := deviceService.TotalByByUserAndSchool(userId, schoolId) //计算总数
	if err != nil {
		result = &enity.Result{"01011001", nil, user_msg["01011001"]}
	} else {
		result = &enity.Result{"01011000", &enity.Pagination{total, list}, user_msg["01011000"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
	@api {get} /api/user/:id/school?schoolId=1101&hasDeviceTotal=1用户学校列表
	@apiName SchoolList
	@apiGroup User
 	@apiSuccessExample Success-Response:
 	@apiParam (参数) {String} schoolId 为空或-1返回全部学校,不为空返回对应学校id聚合
 	@apiParam (参数) {String} hasDeviceTotal 为空或0,不带设备总数，为1带设备总数

   	HTTP/1.1 200 OK
	{
		"status": "01011100",
		"data": [
		    {
			    "id": 12051,
			    "createdAt": "0001-01-01T00:00:00Z",
			    "updatedAt": "0001-01-01T00:00:00Z",
			    "deletedAt": null,
			    "name": "深圳大学",
			    "deviceTotal": 1
		    }
	  	],
	  	"msg": "拉取用户学校列表成功!"
	}
**/
func (self *UserController) SchoolList(ctx *iris.Context) {
	//获取学校id列表
	userId, _ := ctx.ParamInt("id")
	schoolId, _ := ctx.URLParamInt("schoolId")
	hasDeviceTotal, _ := ctx.URLParamInt("hasDeviceTotal")
	schools := &[]*model.School{}

	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	schoolService := &service.SchoolService{}
	//返回全部学校列表
	if schoolId == -1 || ctx.URLParam("schoolId") == "" { //?schoolId=-1或者没有筛选条件
		schoolIdList, err := deviceService.ListSchoolIdByUser(userId)
		if err != nil {
			result = &enity.Result{"01011101", nil, user_msg["01011101"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		//以id列表找学校详情
		schools, err = schoolService.ListByIdList(*schoolIdList)
		if err != nil {
			result = &enity.Result{"01011101", nil, user_msg["01011101"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		//如果带上schoolId=1101的参数只列出该学校
	} else {
		school, err := schoolService.Basic(schoolId)
		if err != nil {
			result = &enity.Result{"01011102", nil, user_msg["01011102"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		*schools = append(*schools, school)
	}
	//判断是否需要带上设备总数
	if hasDeviceTotal == 1 {
		//带上每个学校的设备总数
		for _, school := range *schools {
			//以用户学校为条件查找数量
			deviceTotal, _ := deviceService.TotalByByUserAndSchool(userId, school.Id)
			school.DeviceTotal = deviceTotal
		}
	}

	//返回
	result = &enity.Result{"01011100", schools, user_msg["01011100"]}
	ctx.JSON(iris.StatusOK, result)
}

/**
 	@api {get} /api/user/:id/menu 用户菜单列表
  	@apiName Menu
  	@apiGroup User
  	@apiSuccessExample Success-Response:
 	HTTP/1.1 200 OK
	{
		"status": "01011200",
	  	"data": [
		    {
		      	"id": 1,
		      	"createdAt": "0001-01-01T00:00:00Z",
		      	"updatedAt": "0001-01-01T00:00:00Z",
		      	"deletedAt": null,
		      	"name": "代理商管理",
		      	"url": "/#!/agent/",
		      	"parentId": 0,
		      	"level": 1,
		      	"status": 0
		    },
		    {
		      	"id": 2,
		      	"createdAt": "0001-01-01T00:00:00Z",
		      	"updatedAt": "0001-01-01T00:00:00Z",
		      	"deletedAt": null,
		      	"name": "添加代理商",
		      	"url": "/#!/agent/add",
		      	"parentId": 1,
		      	"level": 2,
		      	"status": 0
		    },...
	  	],
	  	"msg": "拉取用户菜单列表成功!"
	}
*/
func (self *UserController) Menu(ctx *iris.Context) {
	result := &enity.Result{}
	//根据userid找角色id列表
	userId, _ := ctx.ParamInt("id")
	roleService := &service.RoleService{}
	roleIds, err := roleService.ListIdByUserId(userId)
	if err != nil {
		result = &enity.Result{"01011201", nil, user_msg["01011201"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//根据角色id列表找权限id列表
	permissionService := &service.PermissionService{}
	permissionIds, err := permissionService.ListIdsByRoleIds(roleIds)
	if err != nil {
		result = &enity.Result{"01011201", nil, user_msg["01011201"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//根据权限id列表找menu详情
	menuService := &service.MenuService{}
	menuList, err := menuService.ListByPermissionIds(permissionIds)
	if err != nil {
		result = &enity.Result{"01011201", nil, user_msg["01011201"]}
	} else {
		result = &enity.Result{"01011200", menuList, user_msg["01011200"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
 	@api {get} /api/user/:id/permission 用户权限列表
 	@apiName Permission
 	@apiGroup User
   	@apiSuccessExample Success-Response:
 	HTTP/1.1 200 OK
	{
	  	"status": "01011300",
	  	"data": [
		    {
		      	"id": 1,
		      	"createdAt": "0001-01-01T00:00:00Z",
		      	"updatedAt": "0001-01-01T00:00:00Z",
		      	"deletedAt": null,
		      	"name": "代理商管理",
		      	"type": 0,
		      	"status": 0
		    },
		    {
		      	"id": 2,
		      	"createdAt": "0001-01-01T00:00:00Z",
		      	"updatedAt": "0001-01-01T00:00:00Z",
		      	"deletedAt": null,
		      	"name": "添加代理商",
		      	"type": 0,
		      	"status": 0
		    },...
	  	],
	  	"msg": "拉取用户权限列表成功!"
	}
*/
func (self *UserController) Permission(ctx *iris.Context) {
	result := &enity.Result{}
	//根据userid找角色id列表
	userId, _ := ctx.ParamInt("id")
	roleService := &service.RoleService{}
	roleIds, err := roleService.ListIdByUserId(userId)
	if err != nil {
		result = &enity.Result{"01011301", nil, user_msg["01011301"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//根据角色id列表找权限id列表
	permissionService := &service.PermissionService{}
	permissionIds, err := permissionService.ListIdsByRoleIds(roleIds)
	if err != nil {
		result = &enity.Result{"01011301", nil, user_msg["01011301"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//根据权限id列表找权限详情
	permissionList, err := permissionService.ListByIds(permissionIds)
	if err != nil {
		result = &enity.Result{"01011301", nil, user_msg["01011301"]}
	} else {
		result = &enity.Result{"01011300", permissionList, user_msg["01011300"]}
	}
	ctx.JSON(iris.StatusOK, result)
}
