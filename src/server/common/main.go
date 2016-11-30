package common

import (
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/enity"
	"github.com/iris-contrib/middleware/recovery"
	"time"
)

var (
	common_msg = map[string]string{
		"-1": "会话已过期,请重新登录后再试!",
		"-2": "后台系统异常,请重试或稍后再试!",
		"-3": "你所请求的API不存在,请检查后再试!",
		"-4": "你所请求的API超过频率限制,请稍后再试!",
		"-5": "你没有操作该用户id的权限",
	}

)


func SetUpCommon() {

	isDevelopment := viper.GetBool("isDevelopment")

	if !isDevelopment{
		iris.Use(recovery.Handler)
	}

	iris.UseFunc(func(ctx *iris.Context) {
		startAt := time.Now().UnixNano() / 1000000
		ctx.Set("startAt", startAt)
		ctx.Response.Header.Set("X-Powered-By", "soda-manager/v" + viper.GetString("version"))
		ctx.Next()
	})

	iris.OnError(iris.StatusInternalServerError, func(ctx *iris.Context) {
		result := &enity.Result{"-2", nil, common_msg["-2"]}
		Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
	})

	iris.OnError(iris.StatusNotFound, func(ctx *iris.Context) {
		result := &enity.Result{"-3", nil, common_msg["-3"]}
		//Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
	})

	iris.OnError(iris.StatusTooManyRequests, func(ctx *iris.Context) {
		result := &enity.Result{"-4", nil, common_msg["-4"]}
		ctx.JSON(iris.StatusOK, result)
	})

}

var (
	RequireSignin = func(ctx *iris.Context) {
		userId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
		if userId > 0 {
			ctx.Next()
		} else {
			result := &enity.Result{"-1", nil, common_msg["-1"]}
			Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
		}
	}

	//中间件-检查是否有操作改用户id的权限
	// CheckUserId = func(ctx *iris.Context) {
	// 	optUserId, _ := ctx.ParamInt("id") //要操作的用户id
	// 	result := &enity.Result{}
	// 	myUserId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	// 	//根据要操作的用户id查找到其父用户id
	// 	userService := &service.UserService{}
	// 	user, err := userService.Basic(optUserId)
	// 	if err != nil {
	// 		//如果没有找到条目不做处理
	// 		ctx.Next()
	// 		return
	// 	}
	// 	detailMsg := fmt.Sprintf("你的用户id为:%d,你要操作的用户id为:%d,其父id为:%d.", myUserId, optUserId, user.ParentId)
	// 	if (optUserId != myUserId) && (myUserId != user.ParentId) {
	// 		//如果要操作的id既不是我自身的id也不是我的子用户id
	// 		result = &enity.Result{"-5", detailMsg, common_msg["-5"]}
	// 		ctx.JSON(iris.StatusOK, result)
	// 		return
	// 	} else {
	// 		ctx.Next()
	// 	}
	// }
)
