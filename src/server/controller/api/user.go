package controller

import (
	"fmt"
	"github.com/bitly/go-simplejson"
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
	"math/rand"
	"time"
)

type UserController struct {
}

const (
	VERIFICODE_REDIS_PREFIX = "soda-manager-verificode:"

	VERIFICODE_CACHE_SUFFIX = "-cache"     //存储验证码的key后缀
	ERR_TIMES_SUFFIX        = "-err-times" //单条短信验证码错误次数
	IP_TIMES_SUFFIX         = "-ip-times"  //记录ip访问verificode接口的次数

	MAX_VERIFI_ERR_TIMES       = 3  //容许短信验证码的次数
	VERIFICODE_DURATION_SECOND = 60 //设置验证码有效期

	IP_TIMES_DURATION_SECOND = 3600 //每个ip的访问短信接口记录的有限期
	MAX_IP_TIMES             = 10   //在记录有效期内ip访问短信接口容许的最大次数
)

var (
	user_msg = map[string]string{

		"01010100": "登陆成功",
		"01010101": "账号不能为空",
		"01010102": "登陆密码不能为空",
		"01010103": "短信验证码不能为空",
		"01010104": "请先申请发送一个手机验证码",
		"01010105": "短信验证码错误",
		"01010106": "图片验证码不能为空--短信验证码错误次数较多,需要图片验证码一起验证",
		"01010107": "你需要先申请一个图片验证码",
		"01010108": "图片验证码错误--短信验证码错误次数较多,需要图片验证码一起验证",
		"01010109": "账号不存在",
		"01010110": "登陆密码错误",

		"00100200": "注销成功",

		"00100300": "发送验证码成功",
		"00100301": "用户账号不能为空",
		"00100302": "用户账号不存在",
		"00100303": "该用户手机号为空",
		"00100304": "该ip访问次数过于频繁",
		"00100305": "上一个发送的验证码依然存在",
		"00100306": "手机验证码错误",

		"01010400": "拉取用户详情成功!",
		"01010401": "拉取用户详情失败!",

		"01010500": "拉取用户列表成功!",
		"01010501": "拉取用户列表失败!",

		"01010600": "拉取用户设备列表成功!",
		"01010601": "拉取用户设备列表失败!",

		"01010700": "拉取用户指定学校设备列表成功!",
		"01010701": "拉取用户指定学校设备列表失败!",

		"01010800": "拉取用户学校列表成功!",
		"01010801": "拉取用户学校列表失败!",
	}
)

/**
	@api {post} /api/link/signin 用户登陆
 	@apiName Signin
 	@apiGroup User

 	@apiSuccessExample Success-Response:
 	HTTP/1.1 200 OK
	{
	  "status": "01010400",
	  "data": {
	    "id": 1,
	    "created_at": "0001-01-01T00:00:00Z",
	    "updated_at": "0001-01-01T00:00:00Z",
	    "deleted_at": null,
	    "name": "麦芽生活",
	    "contact": "Table",
	    "address": "科兴科学园",
	    "mobile": "13760216425",
	    "account": "13760216425",
	    "password": "e10adc3949ba59abbe56e057f20f883e",
	    "telephone": "",
	    "email": "",
	    "parent_id": 0,
	    "gender": 0,
	    "age": 0,
	    "status": 0
	  },
	  "msg": "拉取用户详情成功!"
	}
*/
func (self *UserController) Signin(ctx *iris.Context) {
	/*获取请求参数*/
	body := simplejson.New()
	ctx.ReadJSON(body)
	account, _ := body.Get("account").String()
	password, _ := body.Get("password").String()
	verificode, _ := body.Get("verificode").String()
	captcha, _ := body.Get("captcha").String()

	/*判断不能为空*/
	if account == "" {
		result := &enity.Result{"01010101", nil, user_msg["01010101"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	if password == "" {
		result := &enity.Result{"01010102", nil, user_msg["01010102"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	if verificode == "" {
		result := &enity.Result{"01010103", nil, user_msg["01010103"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}

	/*请先申请发送一个手机验证码*/
	cache_key := VERIFICODE_REDIS_PREFIX + account + VERIFICODE_CACHE_SUFFIX
	if !common.Redis.Exists(cache_key).Val() {
		result := &enity.Result{"01010104", nil, user_msg["01010104"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}

	/*短信验证码不符*/
	cache_verificode := common.Redis.Get(cache_key).Val()
	err_times_key := VERIFICODE_REDIS_PREFIX + account + ERR_TIMES_SUFFIX
	if verificode != cache_verificode {
		common.Redis.IncrBy(err_times_key, 1) //记录错误次数
		result := &enity.Result{"01010105", nil, user_msg["01010105"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}

	/*虽然短信验证码正常，错误次数超过限制,判断图片验证码*/
	err_times, _ := common.Redis.Get(err_times_key).Uint64()
	if err_times >= MAX_VERIFI_ERR_TIMES {
		if captcha == "" { //短信验证码错误次数较多,需要图片验证码一起验证
			result := &enity.Result{"01010106", nil, user_msg["01010106"]}
			ctx.JSON(iris.StatusOK, &result)
		}
		captchaKey := viper.GetString("server.captcha.Key")
		cache_captcha := ctx.Session().Get(captchaKey)
		if cache_captcha == "" {
			//你需要先申请一个图片验证码
			result := &enity.Result{"01010107", nil, user_msg["01010107"]}
			ctx.JSON(iris.StatusOK, &result)
			return
		}
		if cache_captcha != captcha {
			//图片验证码错误
			result := &enity.Result{"01010108", nil, user_msg["01010108"]}
			ctx.JSON(iris.StatusOK, &result)
			return
		}
	}

	/*账号不存在*/
	userService := &service.UserService{}
	user, err := userService.FindByAccount(account)
	if err != nil {
		result := &enity.Result{"01010109", nil, user_msg["01010109"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}

	/*登陆密码错误*/
	if user.Password != password {
		result := &enity.Result{"01010110", nil, user_msg["01010110"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}

	/*登陆成功*/
	ctx.Session().Set("userid", user.Id)
	result := &enity.Result{"01010100", user, user_msg["01010100"]}
	ctx.JSON(iris.StatusOK, &result)
	return
}

/**
 * @api {get} /api/user/signout 用户注销
 * @apiName Signout
 * @apiGroup User
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
	{
	  "status": "00100200",
	  "data": null,
	  "msg": "注销成功"
	}
*/
func (self *UserController) Signout(ctx *iris.Context) {
	ctx.SessionDestroy()
	result := &enity.Result{"00100200", nil, user_msg["00100200"]}
	ctx.JSON(iris.StatusOK, &result)
}

/**
	@api {get} /api/link/verificode?account=xxx 向特定用户发送验证码
	@apiName SendVerifiCode
	@apiGroup User
	@apiSuccessExample Success-Response:
   	HTTP/1.1 200 OK
  	{
	  "status": "00100300",
	  "data": null,
	  "msg": "发送验证码成功"
	}
*/

func (self *UserController) SendVerifiCode(ctx *iris.Context) {
	account := ctx.URLParam("account")

	/*账号不能为空*/
	if account == "" {
		result := &enity.Result{"00100301", nil, user_msg["00100301"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}

	/*账号不存在*/
	userService := &service.UserService{}
	user, err := userService.FindByAccount(account)
	if err != nil {
		result := &enity.Result{"00100302", nil, user_msg["00100302"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}

	/*该用户手机号为空*/
	if user.Mobile == "" {
		result := &enity.Result{"00100303", nil, user_msg["00100303"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}

	/*该ip访问次数过于频繁*/
	ip_times_key := VERIFICODE_REDIS_PREFIX + ctx.RequestIP() + IP_TIMES_SUFFIX
	if common.Redis.Exists(ip_times_key).Val() {
		ip_times, _ := common.Redis.Get(ip_times_key).Uint64()
		if ip_times >= MAX_IP_TIMES {
			result := &enity.Result{"00100304", nil, user_msg["00100304"]}
			ctx.JSON(iris.StatusOK, &result)
			return
		}
	}

	/*redis中修改ip访问该接口的次数*/
	if !common.Redis.Exists(ip_times_key).Val() { //没有就新建一个
		common.Redis.Set(ip_times_key, 1, IP_TIMES_DURATION_SECOND*time.Second)
	} else { //存在就加1
		common.Redis.IncrBy(ip_times_key, 1)
	}

	/*上一个发送的验证码依然存在（有效期内）*/
	cache_key := VERIFICODE_REDIS_PREFIX + account + VERIFICODE_CACHE_SUFFIX
	if common.Redis.Exists(cache_key).Val() {
		result := &enity.Result{"00100305", nil, user_msg["00100305"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}

	/*以当前时间为种子生成6位随机数*/
	myrand := rand.New(rand.NewSource(time.Now().UnixNano()))
	code := fmt.Sprintf("%06d", myrand.Intn(1000000)) //补零

	/*将随机数保存到redis中设置时限*/
	common.Redis.Set(cache_key, code, VERIFICODE_DURATION_SECOND*time.Second)
	err_times_key := VERIFICODE_REDIS_PREFIX + account + ERR_TIMES_SUFFIX
	common.Redis.Set(err_times_key, 0, VERIFICODE_DURATION_SECOND*time.Second)

	/*调用接口发送手机短信*/
	fmt.Printf("发送的验证码为:%s\n", code)

	result := &enity.Result{"00100300", nil, user_msg["00100300"]}
	ctx.JSON(iris.StatusOK, &result)
}

/**
 * @api {get} /api/user/:id 用户详情
 * @apiName Detail
 * @apiGroup User
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 *	{
 *	  "status": "01010400",
 *	  "data": {
 *	    "id": 1,
 *	    "created_at": "0001-01-01T00:00:00Z",
 *	    "updated_at": "0001-01-01T00:00:00Z",
 *	    "deleted_at": null,
 *	    "name": "麦芽生活",
 *	    "contact": "Table",
 *	    "address": "科兴科学园",
 *	    "mobile": "13760216425",
 *	    "account": "13760216425",
 *	    "password": "e10adc3949ba59abbe56e057f20f883e",
 *	    "telephone": "",
 *	    "email": "",
 *	    "parent_id": 0,
 *	    "gender": 0,
 *	    "age": 0,
 *	    "status": 0
 *	  },
 *	  "msg": "拉取用户详情成功!"
 *	}
 */
func (self *UserController) Basic(ctx *iris.Context) {
	id, _ := ctx.ParamInt("id")
	userService := &service.UserService{}
	result := &enity.Result{}
	user, err := userService.Basic(id)
	if err != nil {
		result = &enity.Result{"01010401", nil, user_msg["01010401"]}
	} else {
		result = &enity.Result{"01010400", user, user_msg["01010400"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
 * @api {get} /api/user 子用户列表
 * @apiName ListByParent
 * @apiGroup User
 */
func (self *UserController) ListByParent(ctx *iris.Context) {
	parentId, _ := ctx.URLParamInt("parent_id")
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("per_page")
	userService := &service.UserService{}
	result := &enity.Result{}
	list, err := userService.SubList(parentId, page, perPage)
	if err != nil {
		result = &enity.Result{"01010501", nil, user_msg["01010501"]}
	} else {
		result = &enity.Result{"01010500", list, user_msg["01010500"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
 * @api {get} /api/user/:id/device 用户设备列表
 * @apiName DeviceList
 * @apiGroup User
 */
func (self *UserController) DeviceList(ctx *iris.Context) {
	userId, _ := ctx.URLParamInt("id")
	deviceService := &service.DeviceService{}
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("per_page")
	result := &enity.Result{}
	list, err := deviceService.ListByUser(userId, page, perPage)
	if err != nil {
		result = &enity.Result{"01010601", nil, user_msg["01010601"]}
	} else {
		result = &enity.Result{"01010600", list, user_msg["01010600"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
 * @api {get} /api/user/:id/school/:schoolId/device 用户指定学校设备列表
 * @apiName DeviceOfSchool
 * @apiGroup User
 */
func (self *UserController) DeviceOfSchool(ctx *iris.Context) {
	userId, _ := ctx.URLParamInt("id")
	schoolId, _ := ctx.URLParamInt("school_id")
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("per_page")
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	list, err := deviceService.ListByUserAndSchool(userId, schoolId, page, perPage)
	if err != nil {
		result = &enity.Result{"01010701", nil, user_msg["01010701"]}
	} else {
		result = &enity.Result{"01010700", list, user_msg["01010700"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

/**
 * @api {get} /api/user/:id/school 用户学校列表
 * @apiName SchoolList
 * @apiGroup User
 	@apiSuccessExample Success-Response:
   	HTTP/1.1 200 OK
	{
	  "status": "01010700",
	  "data": [
	    {
	      "id": 1001,
	      "created_at": "0001-01-01T00:00:00Z",
	      "updated_at": "0001-01-01T00:00:00Z",
	      "deleted_at": null,
	      "name": "清华大学"
	    },
	    {
	      "id": 1002,
	      "created_at": "0001-01-01T00:00:00Z",
	      "updated_at": "0001-01-01T00:00:00Z",
	      "deleted_at": null,
	      "name": "北京大学"
	    }
	  ],
	  "msg": ""
	}
*/
func (self *UserController) SchoolList(ctx *iris.Context) {
	//获取学校id列表
	userId, _ := ctx.ParamInt("id")
	deviceService := &service.DeviceService{}
	schoolIdList, err := deviceService.ListSchoolByUser(userId)
	result := &enity.Result{}
	if err != nil {
		result = &enity.Result{"01010801", nil, user_msg["01010801"]}
	}
	//以id列表找学校详情
	schoolService := &service.SchoolService{}
	schools, err := schoolService.ListByIdList(*schoolIdList)
	if err != nil {
		result = &enity.Result{"01010801", nil, user_msg["01010801"]}
	}
	//返回
	result = &enity.Result{"01010800", schools, user_msg["01010800"]}
	ctx.JSON(iris.StatusOK, result)
}

/**
 * @api {get} /api/user/:id/menu 用户菜单列表
 * @apiName Menu
 * @apiGroup User
 */
func (self *UserController) Menu(ctx *iris.Context) {

}

/**
 * @api {get} /api/user/:id/permission 用户权限列表
 * @apiName Permission
 * @apiGroup User
 */
func (self *UserController) Permission(ctx *iris.Context) {

}
