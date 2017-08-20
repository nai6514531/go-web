package controller

import (
	"crypto/md5"
	"encoding/hex"
	"github.com/bitly/go-simplejson"
	"github.com/mitchellh/mapstructure"
	"github.com/spf13/viper"
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/service/soda"
	"regexp"
	"strconv"
	"strings"
	"encoding/json"
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
	@apiParam (错误码) {String} 01010401 登录账号不能为空
	@apiParam (错误码) {String} 01010402 名称不能为空
	@apiParam (错误码) {String} 01010403 联系人不能为空
	@apiParam (错误码) {String} 01010404 密码不能为空
	@apiParam (错误码) {String} 01010406 联系人手机不能为空
	@apiParam (错误码) {String} 01010407 登录账号已被注册
	@apiParam (错误码) {String} 01010410 新增用户记录失败
	@apiParam (错误码) {String} 01010411 新增用户结算账号失败
	@apiParam (错误码) {String} 01010412 新增用户角色记录失败
	@apiParam (错误码) {String} 01010413 手机号已被使用
	@apiParam (错误码) {String} 01010414 请输入11位的手机号

	@apiParam (错误码) {String} 01010500 修改用户记录成功
	@apiParam (错误码) {String} 01010501 登录账号不能为空
	@apiParam (错误码) {String} 01010502 名称不能为空
	@apiParam (错误码) {String} 01010503 联系人不能为空
	@apiParam (错误码) {String} 01010504 密码不能为空
	@apiParam (错误码) {String} 01010506 联系人手机不能为空
	@apiParam (错误码) {String} 01010507 登录账号已被注册
	@apiParam (错误码) {String} 01010508 手机号码已被使用

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
		"01010401": "登录账号不能为空!",
		"01010402": "名称不能为空!",
		"01010403": "联系人不能为空!",
		"01010404": "密码不能为空!",
		"01010406": "联系人手机不能为空!",
		"01010407": "登录账号已被注册!",
		"01010408": "结算方式不能为空!",
		"01010410": "新增用户记录失败",
		"01010411": "新增用户结算账号失败",
		"01010412": "新增用户角色记录失败",
		"01010413": "手机号已被使用",
		"01010414": "请输入11位的手机号!",
		"01010415": "添加用户记录失败!",
		"01010416": "账号必须为11位手机号码",
		"01010417": "支付宝账号不能为空",
		"01010418": "真实姓名不能为空",
		"01010419": "收款户名不能为空",
		"01010420": "开户支行不能为空",
		"01010421": "银行账号不能为空",
		"01010422": "省份不能为空",
		"01010423": "城市不能为空",
		"01010424": "开户总行不能为空",

		"01010500": "修改用户记录成功!",
		"01010501": "登录账号不能为空!",
		"01010502": "名称不能为空!",
		"01010503": "联系人不能为空!",
		"01010504": "密码不能为空!",
		"01010506": "联系人手机不能为空!",
		"01010507": "登录账号已被注册!",
		"01010508": "手机号码已被使用!",
		"01010509": "结算方式不能为空!",
		"01010511": "修改用户记录失败",
		"01010512": "修改用户结算账号失败",
		"01010513": "请输入11位的手机号!",
		"01010514": "修改用户记录错误!",
		"01010515": "不能对账号进行更新!",
		"01010517": "支付宝账号不能为空",
		"01010518": "真实姓名不能为空",
		"01010519": "收款户名不能为空",
		"01010520": "开户支行不能为空",
		"01010521": "银行账号不能为空",
		"01010522": "省份不能为空",
		"01010523": "城市不能为空",
		"01010524": "开户总行不能为空",
		"01010525": "绑定用户信息出错",

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
		"01011103": "无设备信息!",
		"01011104": "拉取设备信息失败!",

		"01011200": "拉取用户菜单列表成功!",
		"01011201": "拉取用户菜单列表失败!",

		"01011300": "拉取用户权限列表成功!",
		"01011301": "拉取用户权限列表失败!",

		"01011400": "修改密码成功",
		"01011401": "修改密码失败",
		"01011402": "无当前用户信息",
		"01011403": "原始密码错误,请重新输入!",
		"01011404": "新密码不能为空",

		"01011501": "该设备用户信息不存在",
		"01011502": "请操作你自身、下级或Test账号下的设备",

		"01011600": "拉取用户详情成功",
		"01011601": "用户账户不能为空",
		"01011602": "该用户不存在",

		"01011700": "重置密码成功",
		"01011701": "重置密码失败",
		"01011702": "当前账号权限不足，不能重置密码",
		"01011703": "重置密码异常，请稍后再试！",
		"01011704": "该账号不存在，请检查",
		"01011705": "参数异常，请检查请求参数",

		"01011800": "新密码设置成功",
		"01011801": "服务器内部异常",
		"01011802": "账户名不能为空",
		"01011803": "该账号不存在，请检查",
		"01011804": "短信验证码错误",
		"01011805": "密码不能为空",
		"01011806": "重设密码失败",
	}
)

func (self *UserController) SignInUser(ctx *iris.Context) {
	userService := &service.UserService{}
	result := &enity.Result{}
	format := ctx.URLParam("format")
	common.Logger.Debug("format========", format)
	list, err := userService.ListOfSignIn(format)
	if err != nil {
		result = &enity.Result{"1", err, "拉取注册用户数据异常"}
		common.Log(ctx, result)
	} else {
		result = &enity.Result{"0", list, "拉取注册用户数据成功"}
	}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

/**
	@api {post} /api/signin 用户登录
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

	captchaKey := viper.GetString("server.captcha.key")
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
		result := &enity.Result{"01010109", err.Error(), user_msg["01010109"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}

	/*登录密码错误*/
	if user.Password != password {
		result := &enity.Result{"01010110", nil, user_msg["01010110"]}
		returnCleanCaptcha(result)
		return
	}

	/*登录成功*/
	ctx.Session().Set(viper.GetString("server.session.user.id"), user.Id)

	result := &enity.Result{"01010100", user, user_msg["01010100"]}
	returnCleanCaptcha(result)
	common.Log(ctx, nil)
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
	sess := viper.GetString("server.session.cookie")
	ctx.RemoveCookie(sess)
	result := &enity.Result{"00100200", nil, user_msg["00100200"]}
	ctx.JSON(iris.StatusOK, &result)
	common.Log(ctx, nil)
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

	//获取cashAccount
	cashAccount := &model.UserCashAccount{}
	mapstructure.Decode(user.CashAccount, cashAccount)

	//user信息校验
	if user.Account == "" {
		result = &enity.Result{"01010401", nil, user_msg["01010401"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if user.Password == "" {
		result = &enity.Result{"01010404", nil, user_msg["01010404"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//账号信息必须为11位数字(手机)
	//match, _ := regexp.MatchString(`^\d{11}$`, user.Account)
	match, _ := regexp.MatchString(`^\w{5,15}$`, user.Account)
	if !match {
		result = &enity.Result{"01010416", nil, user_msg["01010416"]}
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
	//判断登录名是否已经存在
	currentUser, _ := userService.FindByAccount(user.Account)
	if currentUser != nil {
		//可以找到
		result = &enity.Result{"01010407", nil, user_msg["01010407"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}

	//校验cashAccount

	if cashAccount.Type == 1 {
		if cashAccount.Account == "" {
			result = &enity.Result{"01010417", nil, user_msg["01010417"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.RealName == "" {
			result = &enity.Result{"01010418", nil, user_msg["01010418"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
	}
	if cashAccount.Type == 3 {
		if cashAccount.Account == "" {
			result = &enity.Result{"01010421", nil, user_msg["01010421"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.RealName == "" {
			result = &enity.Result{"01010419", nil, user_msg["01010419"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.HeadBankName == "" {
			result = &enity.Result{"01010424", nil, user_msg["01010424"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.BankName == "" {
			result = &enity.Result{"01010420", nil, user_msg["01010420"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.ProvinceId == 0 {
			result = &enity.Result{"01010422", nil, user_msg["01010422"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.CityId == 0 {
			result = &enity.Result{"01010423", nil, user_msg["01010423"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
	}

	//插入user到user表
	user.ParentId, _ = ctx.Session().GetInt(viper.GetString("server.session.user.id")) //设置session userId作为parentid
	_, err := userService.Create(&user)
	if err != nil {
		result = &enity.Result{"01010410", err.Error(), user_msg["01010410"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//插入结算账号信息，type为0也新建
	userNew, err := userService.FindByAccount(user.Account) //得到新插入的条目
	if err != nil {
		result = &enity.Result{"01010415", err.Error(), user_msg["01010415"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	cashAccount.UserId = userNew.Id //cash记录的userid设置为新插入条目的id
	_, err = userCashAccountService.Create(cashAccount)
	if err != nil {
		result = &enity.Result{"01010411", err.Error(), user_msg["01010411"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	//插入一条用户角色记录（暂时所有调用此的api都是运营商角色）
	userRoleRel := &model.UserRoleRel{}
	userRoleRel.UserId = user.Id
	userRoleRel.RoleId = 2 //统一为用户角色
	userRoleRelSevice := &service.UserRoleRelService{}
	_, err = userRoleRelSevice.Create(userRoleRel)
	if err != nil {
		result = &enity.Result{"01010412", err.Error(), user_msg["01010412"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	result = &enity.Result{"01010400", nil, user_msg["01010400"]}
	ctx.JSON(iris.StatusOK, &result)
	common.Log(ctx, nil)
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
	var user model.User
	userId, _ := ctx.ParamInt("id")
	//parentId = ctx.Session().GetInt(viper.GetString("server.session.user.id")) //设置session userId作为parentid
	userService := &service.UserService{}
	userCashAccountService := &service.UserCashAccountService{}
	result := &enity.Result{}
	ctx.ReadJSON(&user)
	user.Id = userId
	//user信息校验
	//判断登录名是否已经存在,不能对account进行更新
	if user.Account != "" {
		//如果有登录账号传入
		result = &enity.Result{"01010515", nil, user_msg["01010515"]}
		ctx.JSON(iris.StatusOK, result)
		return
		// currentUser, _ := userService.FindByAccount(user.Account)
		// if (currentUser != nil) && (currentUser.Id != userId) {
		// 	//可以找到,并且不为将要修改的那一条记录
		// 	result = &enity.Result{"01010507", nil, user_msg["01010507"]}
		// 	ctx.JSON(iris.StatusOK, result)
		// 	return
		// }
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
		/*currentUser, _ := userService.FindByMobile(user.Mobile)
		if (currentUser != nil) && (currentUser.Id != userId) {
			//可以找到,并且不为将要修改的那一条记录
			result = &enity.Result{"01010508", nil, user_msg["01010508"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}*/
	}

	//cashAccount
	cashAccount := &model.UserCashAccount{}
	mapstructure.Decode(user.CashAccount, cashAccount)
	cashAccount.UserId = userId
	common.Logger.Debugln(cashAccount)
	// //cash内容判断
	// if (cashAccount.Type != 1) && (cashAccount.Type != 2) && (cashAccount.Type != 3) {
	// 	//1-实时分账，2-财务结算
	// 	result = &enity.Result{"01010509", nil, user_msg["01010509"]}
	// 	ctx.JSON(iris.StatusOK, result)
	// 	return
	// }
	// if cashAccount.Account == "" {
	// 	result = &enity.Result{"01010510", nil, user_msg["01010510"]}
	// 	ctx.JSON(iris.StatusOK, result)
	// 	return
	// }

	//更新到user表
	_, err := userService.Update(&user)
	if err != nil {
		result = &enity.Result{"01010511", err.Error(), user_msg["01010511"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//更新结算账号信息,如果传的不是0就直接更新
	// if cashAccount.Type != 0 {
	// 	ok = userCashAccountService.UpdateByUserId(cashAccount)
	// 	if !ok {
	// 		result = &enity.Result{"01010512", nil, user_msg["01010512"]}
	// 		common.Log(ctx, result)
	// 		ctx.JSON(iris.StatusOK, result)
	// 		return
	// 	}
	// } else { //如果传的是0，如果本来的记录是type为1的话就改为-1,2的话改为-2,原来是-1的话还是-1，方便还原上一条历史记录
	// 	current, err := userCashAccountService.BasicByUserId(userId)
	// 	if err == nil { //可以找到
	// 		if current.Type > 0 {
	// 			//把该记录的type值取反
	// 			current.Type = -current.Type
	// 		}
	// 		ok = userCashAccountService.UpdateByUserId(current)
	// 		if !ok {
	// 			result = &enity.Result{"01010512", nil, user_msg["01010512"]}
	// 			common.Log(ctx, result)
	// 			ctx.JSON(iris.StatusOK, result)
	// 			return
	// 		}
	// 	} //没有记录的不做处理
	// }

	//校验cashAccount

	if cashAccount.Type == 1 {
		if cashAccount.Account == "" {
			result = &enity.Result{"01010517", nil, user_msg["01010517"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.RealName == "" {
			result = &enity.Result{"01010518", nil, user_msg["01010518"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
	}
	if cashAccount.Type == 3 {
		if cashAccount.Account == "" {
			result = &enity.Result{"01010521", nil, user_msg["01010521"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.RealName == "" {
			result = &enity.Result{"01010519", nil, user_msg["01010519"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.HeadBankName == "" {
			result = &enity.Result{"01010524", nil, user_msg["01010524"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.BankName == "" {
			result = &enity.Result{"01010520", nil, user_msg["01010520"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.ProvinceId == 0 {
			result = &enity.Result{"01010522", nil, user_msg["01010522"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.CityId == 0 {
			result = &enity.Result{"01010523", nil, user_msg["01010523"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
	}
	if cashAccount.Type == 2 {
		// 微信支付,从redis取信息
		key := user.Key
		if key != "" {
			prefix := viper.GetString("auth.prefix")
			// json字符串,将json转成map
			userExtra := common.Redis.Get(prefix+"user:"+key+":")
			userExtraMap := make(map[string]interface{})
			err = json.Unmarshal([]byte(userExtra.Val()),&userExtraMap)
			// 将微信获取到的信息存到user中
			user.Extra = userExtra.Val()
			err := userService.UpdateWechatInfo(&user)
			if err != nil {
				result = &enity.Result{"01010525", err.Error(), user_msg["01010525"]}
				common.Log(ctx, result)
				ctx.JSON(iris.StatusOK, result)
				return
			}
			cashAccount.Account = userExtraMap["openid"].(string)
		}
	}
	//修改直接前端传什么type就保存什么
	_, err = userCashAccountService.UpdateByUserId(cashAccount)
	if err != nil {
		result = &enity.Result{"01010512", err.Error(), user_msg["01010512"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	result = &enity.Result{"01010500", nil, user_msg["01010500"]}
	ctx.JSON(iris.StatusOK, &result)
	common.Log(ctx, nil)
}

/*换成simplejson的实现方法*/
/*func (self *UserController) Update(ctx *iris.Context) {
	userId, _ := ctx.ParamInt("id")
	userService := &service.UserService{}
	userCashAccountService := &service.UserCashAccountService{}
	result := &enity.Result{}
	userMap := simplejson.New()
	ctx.ReadJSON(&userMap)

	//user信息校验
	//判断登录名是否已经存在,不能对account进行更新
	if userMap.Get("account").MustString() != "" {
		//如果有登录账号传入
		result = &enity.Result{"01010515", nil, user_msg["01010515"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//判断手机号码是否已经存在
	//if user.Mobile != "" {
	if userMap.Get("mobile").MustString() != "" {
		//判断手机号是否为11位
		if len(userMap.Get("mobile").MustString()) != 11 {
			result = &enity.Result{"01010513", nil, user_msg["01010513"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
	}

	var user model.User
	user.Id = userId
	user.Name = userMap.Get("name").MustString()
	user.Contact = userMap.Get("contact").MustString()
	user.Mobile = userMap.Get("mobile").MustString()
	user.Telephone = userMap.Get("telephone").MustString()
	user.Address = userMap.Get("address").MustString()
	user.Email = userMap.Get("email").MustString()
	//更新到user表
	_, err := userService.Update(&user)
	if err != nil {
		result = &enity.Result{"01010511", err.Error(), user_msg["01010511"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	//cashAccount
	cashAccountMap := userMap.Get("cashAccount").MustMap()
	common.Logger.Debugln(cashAccountMap)
	//校验cashAccount
	cashAccount := &model.UserCashAccount{}
	if cashAccountMap["type"].(int) == 1 {

		if cashAccount.Account == "" {
			result = &enity.Result{"01010517", nil, user_msg["01010517"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if cashAccount.RealName == "" {
			result = &enity.Result{"01010518", nil, user_msg["01010518"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		cashAccount.Account = cashAccountMap["account"].(string)
	}
	if cashAccountMap["type"].(int) == 2 {
		// 微信支付,从redis取信息
		key := userMap.Get("key").MustString()
		prefix := viper.GetString("auth.prefix")
		// json字符串,将json转成map
		userExtra := common.Redis.Get(prefix+"user:"+key+":")
		userExtraMap := make(map[string]interface{})
		err = json.Unmarshal([]byte(userExtra.Val()),&userExtraMap)
		// 将微信获取到的信息存到user中
		user.Extra = userExtra.Val()
		err := userService.UpdateWechatInfo(&user)
		if err != nil {
			result = &enity.Result{"01010511", err.Error(), user_msg["01010511"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		cashAccount.Account = userExtraMap["openid"].(string)
	}
	cashAccount.RealName = cashAccountMap["realName"].(string)
	cashAccount.UserId = userId
	cashAccount.Type = cashAccountMap["type"].(int)
	//修改直接前端传什么type就保存什么
	_, err = userCashAccountService.UpdateByUserId(cashAccount)
	if err != nil {
		result = &enity.Result{"01010512", err.Error(), user_msg["01010512"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	result = &enity.Result{"01010500", nil, user_msg["01010500"]}
	ctx.JSON(iris.StatusOK, &result)
	common.Log(ctx, nil)
}*/

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
		result = &enity.Result{"01010602", err.Error(), user_msg["01010602"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	userCashAccountService := &service.UserCashAccountService{}
	cashAccount, err := userCashAccountService.BasicByUserId(id)
	if err != nil {
		result = &enity.Result{"01010601", err.Error(), user_msg["01010601"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	user.CashAccount = cashAccount
	deviceTotal, err := userService.TotalOfDevice(id)
	if err != nil {
		result = &enity.Result{"01010601", err.Error(), user_msg["01010601"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	user.DeviceTotal = deviceTotal
	result = &enity.Result{"01010600", user.Mapping(), user_msg["01010600"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
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
	searchStr := ctx.URLParam("searchStr")
	userId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	userService := &service.UserService{}
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	list, err := userService.SubList(userId, searchStr, page, perPage)
	if err != nil {
		result = &enity.Result{"01010701", err.Error(), user_msg["01010701"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	total, err := userService.TotalByParentId(userId, searchStr)
	if err != nil {
		result = &enity.Result{"01010702", err.Error(), user_msg["01010702"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	for _, user := range *list {
		userIds, err := userService.SubChildIdsByUserId(user.Id) //获取所有子子。。用户id列表
		if err != nil {
			result = &enity.Result{"01010701", err.Error(), user_msg["01010701"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		userIds = append(userIds, user.Id) //把自己也加上
		deviceTotal, err := deviceService.TotalByUserIds(userIds)
		if err != nil {
			result = &enity.Result{"01010701", err.Error(), user_msg["01010701"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		user.DeviceTotal = deviceTotal
	}
	result = &enity.Result{"01010700", &enity.Pagination{total, list}, user_msg["01010700"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
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
		result = &enity.Result{"01010801", err.Error(), user_msg["01010801"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//带上总设备数的信息
	var ids []int
	ids = append(ids, id)                                //把自己也算上
	childIds, err := userService.SubChildIdsByUserId(id) //计算该用户下面的所有子子。。用户列表
	if err != nil {
		result = &enity.Result{"01010801", err.Error(), user_msg["01010801"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if childIds != nil {
		ids = append(ids, childIds...)
	}
	deviceTotal, err := deviceService.TotalByUserIds(ids) //根据userid列表算出设备总数
	if err != nil {
		result = &enity.Result{"01010801", err.Error(), user_msg["01010801"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	user.DeviceTotal = deviceTotal
	//返回
	result = &enity.Result{"01010800", user, user_msg["01010800"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
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
	if err != nil {
		result = &enity.Result{"01010901", err.Error(), user_msg["01010901"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	total, err := deviceService.TotalByUser(userId)
	if err != nil {
		result = &enity.Result{"01010901", err.Error(), user_msg["01010901"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01010900", &enity.Pagination{total, list}, user_msg["01010900"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
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
	deviceStr := ctx.URLParam("deviceStr")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	serialNums := strings.Split(deviceStr, ",")
	list, err := deviceService.ListByUserAndSchool(userId, schoolId, page, perPage, serialNums...)
	if err != nil {
		result = &enity.Result{"01011001", err.Error(), user_msg["01011001"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	total, err := deviceService.TotalByByUserAndSchool(userId, schoolId, serialNums...) //计算总数
	if err != nil {
		result = &enity.Result{"01011001", err.Error(), user_msg["01011001"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01011000", &enity.Pagination{total, list}, user_msg["01011000"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
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
	deviceStr := ctx.URLParam("deviceStr")
	schoolIds := make([]int, 0)
	schools := &[]*model.School{}

	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	schoolService := &service.SchoolService{}
	serialNums := strings.Split(deviceStr, ",")
	common.Logger.Debugln("serialNums===========", serialNums)
	common.Logger.Debugln("schoolId===========", schoolId)
	if schoolId != -1 && ctx.URLParam("schoolId") != "" {
		schoolIds = append(schoolIds, schoolId)
	}
	if len(serialNums) > 0 && serialNums[0] != "" {
		common.Logger.Debugln("=======================")
		list, err := deviceService.ListBySerialNumber(userId, schoolId, serialNums...)
		if err != nil {
			result = &enity.Result{"01011104", err.Error(), user_msg["01011104"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if len(*list) <= 0 {
			result = &enity.Result{"01011100", err.Error(), user_msg["01011100"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, nil)
			return
		}
		for _, _device := range *list {
			schoolIds = append(schoolIds, _device.SchoolId)
		}
	}
	common.Logger.Debugln("schoolIds=============", schoolIds)
	common.Logger.Debugln("schoolId===========", schoolId)

	//返回全部学校列表
	if (schoolId == -1 || ctx.URLParam("schoolId") == "") && len(schoolIds) <= 0 {
		//?schoolId=-1或者没有筛选条件
		schoolIdList, err := deviceService.ListSchoolIdByUser(userId)
		if err != nil {
			result = &enity.Result{"01011101", err.Error(), user_msg["01011101"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		//以id列表找学校详情
		schools, err = schoolService.ListByIdList(*schoolIdList)
		if err != nil {
			result = &enity.Result{"01011101", err.Error(), user_msg["01011101"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		//如果带上schoolId=1101的参数只列出该学校
	} else {
		common.Logger.Debugln("schoolIds=====", schoolIds)
		schoolList, err := schoolService.List(schoolIds...)
		if err != nil {
			result = &enity.Result{"01011102", err.Error(), user_msg["01011102"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		*schools = append(*schools, *schoolList...)
	}
	//判断是否需要带上设备总数
	if hasDeviceTotal == 1 {
		//带上每个学校的设备总数
		for _, school := range *schools {
			//以用户学校为条件查找数量
			deviceTotal, err := deviceService.TotalByByUserAndSchool(userId, school.Id)
			if err != nil {
				result = &enity.Result{"01011101", err.Error(), user_msg["01011101"]}
				common.Log(ctx, result)
				ctx.JSON(iris.StatusOK, result)
				return
			}
			school.DeviceTotal = deviceTotal
		}
	}

	//返回
	result = &enity.Result{"01011100", schools, user_msg["01011100"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
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
		      	"name": "运营商管理",
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
		      	"name": "添加运营商",
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
		result = &enity.Result{"01011201", err.Error(), user_msg["01011201"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//根据角色id列表找权限id列表
	permissionService := &service.PermissionService{}
	permissionIds, err := permissionService.ListIdsByRoleIds(roleIds)
	if err != nil {
		result = &enity.Result{"01011201", err.Error(), user_msg["01011201"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//根据权限id列表找menu详情
	menuService := &service.MenuService{}
	menuList, err := menuService.ListByPermissionIds(permissionIds)
	if err != nil {
		result = &enity.Result{"01011201", err.Error(), user_msg["01011201"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01011200", menuList, user_msg["01011200"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
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
		      	"name": "运营商管理",
		      	"type": 0,
		      	"status": 0
		    },
		    {
		      	"id": 2,
		      	"createdAt": "0001-01-01T00:00:00Z",
		      	"updatedAt": "0001-01-01T00:00:00Z",
		      	"deletedAt": null,
		      	"name": "添加运营商",
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
		result = &enity.Result{"01011301", err.Error(), user_msg["01011301"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//根据角色id列表找权限id列表
	permissionService := &service.PermissionService{}
	permissionIds, err := permissionService.ListIdsByRoleIds(roleIds)
	if err != nil {
		result = &enity.Result{"01011301", err.Error(), user_msg["01011301"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//根据权限id列表找权限详情
	permissionList, err := permissionService.ListByIds(permissionIds)
	if err != nil {
		result = &enity.Result{"01011301", err.Error(), user_msg["01011301"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01011300", permissionList, user_msg["01011300"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, nil)
}

func (self *UserController) ChipcardOper(ctx *iris.Context) {
	userId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	permissionService :=  service.PermissionService{}
	common.Logger.Debug(userId)
	boo := permissionService.ChipcardOper(userId)
	result := &enity.Result{"01011300",boo,user_msg["01011300"]}
	ctx.JSON(iris.StatusOK,result)
}

func (self *UserController) Password(ctx *iris.Context) {
	userService := &service.UserService{}
	result := &enity.Result{}
	var err error
	current := ctx.URLParam("current")
	newer := ctx.URLParam("newer")
	userId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	user, err := userService.Basic(userId)
	if err != nil {
		result = &enity.Result{"01011402", err.Error(), user_msg["01011402"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	common.Logger.Debugln("password====", user.Password)
	common.Logger.Debugln("current=====", current)
	if user.Password != current {
		result = &enity.Result{"01011403", nil, user_msg["01011403"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if newer == "" {
		result = &enity.Result{"01011404", nil, user_msg["01011404"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	_, err = userService.Password(userId, newer)
	if err != nil {
		result = &enity.Result{"01011401", err.Error(), user_msg["01011401"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01011400", nil, user_msg["01011400"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *UserController) ResetPassword(ctx *iris.Context) {
	body := simplejson.New()
	ctx.ReadJSON(body)
	account, _ := body.Get("account").String()
	_password, _ := body.Get("password").String()
	_type, _ := body.Get("type").Int()
	result := &enity.Result{}
	if account == "" || _type == 0 {
		result = &enity.Result{"01011705", nil, user_msg["01011705"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}

	userService := &service.UserService{}
	acccuntService := &sodaService.AccountService{}

	roleService := &service.RoleService{}
	userId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	role, err := roleService.BasicByUserId(userId)
	if err != nil {
		result = &enity.Result{"01011703", err.Error(), user_msg["01011703"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if role.Id != 4 && role.Id != 1 {
		result = &enity.Result{"01011702", nil, user_msg["01011702"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	md5Ctx := md5.New()
	_password = strings.Trim(_password, " ")
	if _password == "" {
		_password = viper.GetString("user.account.password.default")
	}
	md5Ctx.Write([]byte(_password))
	password := hex.EncodeToString(md5Ctx.Sum(nil))
	if len(password) == 0 {
		result = &enity.Result{"01011703", err.Error(), user_msg["01011703"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if _type == 1 {
		user, err := userService.FindByAccount(account)
		if err != nil {
			result = &enity.Result{"01011704", err.Error(), user_msg["01011704"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		_, err = userService.Password(user.Id, password)
		if err != nil {
			result = &enity.Result{"01011701", err.Error(), user_msg["01011701"]}
			ctx.JSON(iris.StatusOK, result)
			return
		} else {
			result = &enity.Result{"01011700", nil, user_msg["01011700"]}
			ctx.JSON(iris.StatusOK, result)
		}
	} else {
		_account, err := acccuntService.FindByMobile(account)
		if err != nil {
			result = &enity.Result{"01011704", err.Error(), user_msg["01011704"]}
			ctx.JSON(iris.StatusOK, result)
			return
		}
		_, err = acccuntService.UpdatePasswordByMobile(_account.Mobile, password)
		if err != nil {
			result = &enity.Result{"01011701", err.Error(), user_msg["01011701"]}
			ctx.JSON(iris.StatusOK, result)
			return
		} else {
			result = &enity.Result{"01011700", nil, user_msg["01011700"]}
			ctx.JSON(iris.StatusOK, result)
		}
	}
}

func (self *UserController) IsMeOrSub(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id") //前端传的id
	result := &enity.Result{}
	userId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	//根据要操作的设备id查找
	userService := &service.UserService{}
	user, err := userService.Basic(id)
	if err != nil {
		result = &enity.Result{"01011501", err.Error(), user_msg["01011501"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if id == userId || user.ParentId == userId || userId == 1 {
		ctx.Next()
		return
	} else {
		result = &enity.Result{"01011502", nil, user_msg["01011502"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
}

func (self *UserController) DetailByAccount(ctx *iris.Context) {
	result := &enity.Result{}
	account := ctx.Param("account")
	if strings.Trim(account, " ") == "" {
		result = &enity.Result{"01011601", nil, user_msg["01011601"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	userService := &service.UserService{}
	user, err := userService.FindByAccount(account)
	if err != nil || user == nil {
		result = &enity.Result{"01011602", err.Error(), user_msg["01011602"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01011600", user, user_msg["01011600"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)

}

func (self *UserController) ForgetPassword(ctx *iris.Context) {
	userService := &service.UserService{}
	smsService := &service.SmsService{}
	result := &enity.Result{}
	params := simplejson.New()
	err := ctx.ReadJSON(&params)
	if err != nil {
		result = &enity.Result{"01011801", nil, user_msg["01011801"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	account := params.Get("account").MustString()
	if account == "" {
		result = &enity.Result{"01011802", nil, user_msg["01011802"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//校验短信验证码
	motivation := "RESET_PASSWORD"
	user, err := userService.FindByAccount(account)
	if err != nil {
		result = &enity.Result{"01011803", err, user_msg["01011803"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	prefix := viper.GetString("sms.prefix")
	key := prefix + motivation + ":" + strconv.Itoa(user.Id)
	code := params.Get("code").MustString()
	if !smsService.VerifySmsCodes(key, code) {
		result = &enity.Result{"01011804", nil, user_msg["01011804"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	password := params.Get("password").MustString()
	if password == "" {
		result = &enity.Result{"01011805", nil, user_msg["01011805"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//重设密码
	_, err = userService.Password(user.Id, password)
	if err != nil {
		result = &enity.Result{"01011806", err, user_msg["01011806"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01011800", nil, user_msg["01011800"]}
	common.Log(ctx, result)
	ctx.JSON(iris.StatusOK, result)
}
