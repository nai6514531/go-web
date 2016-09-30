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
	}
)

/**
 * @api {post} /api/user/signin 用户登陆
 * @apiName Signin
 * @apiGroup User
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
	resultData := make(map[string]interface{})
	ctx.Session().Set("userid", user.Id)
	resultData["user"] = user
	result := &enity.Result{"01010100", resultData, user_msg["01010100"]}
	ctx.JSON(iris.StatusOK, &result)
	return
}

/**
 * @api {get} /api/user/signout 用户注销
 * @apiName Signout
 * @apiGroup User
 */
func (self *UserController) Signout(ctx *iris.Context) {
	ctx.SessionDestroy()
	result := &enity.Result{"00100200", nil, user_msg["00100200"]}
	ctx.JSON(iris.StatusOK, &result)
}

/**
 * @api {get} /api/user/verificode?account=xxx 向特定用户发送验证码
 * @apiName SendVerifiCode
 * @apiGroup User
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
 * @apiName Detail
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
