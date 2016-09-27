package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
)

var (
	session_msg = map[string]string{

		"00100000": "登陆成功",
		"00100001": "请求参数不能被解析或请求参数为空",
		"00100002": "用户账号不存在",
		"00100003": "密码或验证码输入错误",

		"00100100": "退出登陆",
	}
)

type SessionController struct {
}

/**
 * @api {post} /api/session 创建会话（登陆）
 * @apiName Create
 * @apiGroup session
 */
func (self *SessionController) Create(ctx *iris.Context) {
	type Request struct {
		Account  string `json:"account"`  //账号
		Password string `json:"password"` //密码
	}
	r := &Request{}
	ctx.ReadJSON(r)
	//请求参数不能被解析或请求参数为空
	if r.Account == "" || r.Password == "" {
		result := &enity.Result{"00100001", nil, session_msg["00100001"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	//以用户名查表
	userService := &service.UserService{}
	user, err := userService.FindByAccount(r.Account)
	if err != nil { //如果不能查到
		result := &enity.Result{"00100002", nil, session_msg["00100002"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	//对密码进行验证
	if r.Password != user.Password {
		result := &enity.Result{"00100003", nil, session_msg["00100003"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	//返回登陆成功
	ctx.Session().Set("user_id", user.Id) //缓存用户id
	result := &enity.Result{"00100000", nil, session_msg["00100000"]}
	ctx.JSON(iris.StatusOK, &result)

}

/**
 * @api {delete} /api/session 删除会话（退出）
 * @apiName Create
 * @apiGroup session
 */
func (self *SessionController) Delete(ctx *iris.Context) {
	//直接删除整个session
	ctx.SessionDestroy()
	result := &enity.Result{"00100000", nil, session_msg["00100000"]}
	ctx.JSON(iris.StatusOK, &result)
}

/**
 * @api {post} /api/session 创建会话（登陆）
 * @apiName Create
 * @apiGroup session
 */
// func (self *SessionController) Create1(ctx *iris.Context) {
// 	account := ctx.URLParam("account")
// 	urlMd5PasswordCaptcha := ctx.URLParam("password")
// 	userService := &service.UserService{}

// 	//以用户名查找表
// 	user, err := userService.FindByAccount(account)
// 	if err != nil {
// 		print(err.Error())
// 	}

// 	//以 md5( md5(明文密码) + 验证码) 比对
// 	dbMd5Password := fmt.Sprintf("%x", md5.Sum([]byte(user.Password)))
// 	captchaKey := viper.GetString("server.captcha.Key")
// 	sPasswordCaptcha := fmt.Sprintf("%s%s", dbMd5Password, ctx.Session().Get(captchaKey))
// 	dbMd5PasswordCaptcha := fmt.Sprintf("%x", md5.Sum([]byte(sPasswordCaptcha)))

// 	if dbMd5PasswordCaptcha == urlMd5PasswordCaptcha { //比对符合确认登陆,设置session
// 		ctx.Session().Set("isSignin", 1)
// 		ctx.Session().Set("account", account) //缓存账号
// 	} else {
// 		ctx.Session().Set("isSignin", 0)
// 	}

// 	ctx.JSON(iris.StatusOK, user)
// }
