package controller

import (
	"crypto/md5"
	"fmt"
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
)

type UserController struct {
}

var (
	user_msg = map[string]string{

		"01010100": "拉取用户详情成功!",
		"01010101": "拉取用户详情失败!",

		"01010200": "拉取用户列表成功!",
		"01010201": "拉取用户列表失败!",
	}
)

/**
 * @api {get} /api/user/signin 用户登陆
 * @apiName Signin
 * @apiGroup User
 */
func (self *UserController) Signin(ctx *iris.Context) {
	account := ctx.URLParam("account")
	urlMd5PasswordCaptcha := ctx.URLParam("password")
	userService := &service.UserService{}

	//以用户名查找表
	user, err := userService.FindByAccount(account)
	if err != nil {
		print(err.Error())
	}

	//以 md5( md5(明文密码) + 验证码) 比对
	dbMd5Password := fmt.Sprintf("%x", md5.Sum([]byte(user.Password)))
	captchaKey := viper.GetString("server.captcha.Key")
	sPasswordCaptcha := fmt.Sprintf("%s%s", dbMd5Password, ctx.Session().Get(captchaKey))
	dbMd5PasswordCaptcha := fmt.Sprintf("%x", md5.Sum([]byte(sPasswordCaptcha)))

	if dbMd5PasswordCaptcha == urlMd5PasswordCaptcha {
		//比对符合确认登陆,设置session
		ctx.Session().Set("isSignin", 1)
		ctx.Session().Set("account", account) //缓存账号
	} else {
		ctx.Session().Set("isSignin", 0)
	}

	ctx.JSON(iris.StatusOK, user)
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
		result = &enity.Result{"01010101", nil, user_msg["01010101"]}
	} else {
		result = &enity.Result{"01010100", user, user_msg["01010100"]}
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
		result = &enity.Result{"01010201", nil, user_msg["01010201"]}
	} else {
		result = &enity.Result{"01010200", list, user_msg["01010200"]}
	}
	ctx.JSON(iris.StatusOK, result)
}
