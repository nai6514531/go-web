package controller

import (
	"github.com/kataras/iris"
	//"maizuo.com/soda-manager/src/server/model"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/service"
	//"strconv"
	"crypto/md5"
	"fmt"
)

type UserController struct {
}

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

	if dbMd5PasswordCaptcha == urlMd5PasswordCaptcha { //比对符合确认登陆,设置session
		ctx.Session().Set("isSignin", 1)
		ctx.Session().Set("account", account) //缓存账号
	} else {
		ctx.Session().Set("isSignin", 0)
	}

	ctx.JSON(iris.StatusOK, user)
}

// func (self *UserController) Test(ctx *iris.Context) {
// 	ctx.Write("aaaaaaaaaaaa")
// }
