package controller

import (
	"fmt"
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
)

type CommonController struct {
}

var (
	common_msg = map[string]string{
		"01010001": "请先登陆再调用api",
		"01010002": "你没有操作该用户id的权限",
	}
)

//所有api需要经过的中间件
func (self *CommonController) CheckApiRoot(ctx *iris.Context) {
	//your authentication logic here...
	println("from ", ctx.MethodString(), ctx.PathString())
	authorized := true
	if authorized {
		ctx.Next()
	} else {
		ctx.Text(401, ctx.PathString()+" is not authorized for you")
	}
}

//中间件-检查是否有操作改用户id的权限
func (self *CommonController) CheckUserId(ctx *iris.Context) {
	optUserId, _ := ctx.ParamInt("id") //要操作的用户id
	result := &enity.Result{}
	myUserId := ctx.Session().GetInt(viper.GetString("server.auth.session.userIdKey"))
	//根据要操作的用户id查找到其父用户id
	userService := &service.UserService{}
	user, err := userService.Basic(optUserId)
	if err != nil { //如果没有找到条目不做处理
		ctx.Next()
		return
	}
	detailMsg := fmt.Sprintf("你的用户id为:%d,你要操作的用户id为:%d,其父id为:%d.", myUserId, optUserId, user.ParentId)
	if (optUserId != myUserId) && (myUserId != user.ParentId) { //如果要操作的id既不是我自身的id也不是我的子用户id
		result = &enity.Result{"01010002", detailMsg, common_msg["01010002"]}
		ctx.JSON(iris.StatusOK, result)
		return
	} else {
		ctx.Next()
	}
}
