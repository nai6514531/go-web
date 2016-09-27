package api

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/controller/api"
)

func Api() {

	api := iris.Party("/api", func(ctx *iris.Context) {
		println("Middleware for all party's routes!")
		ctx.Response.Header.Set("Server", ctx.RemoteAddr())
		ctx.Next()
	})

	var (
		user    = &controller.UserController{}
		session = &controller.SessionController{}
	)

	api.Post("/session", session.Create) //创建会话（登陆）

	api.UseFunc(func(ctx *iris.Context) {
		//your authentication logic here...
		println("from ", ctx.PathString())
		authorized := true
		if authorized {
			ctx.Next()
		} else {
			ctx.Text(401, ctx.PathString()+" is not authorized for you")
		}
	})

	api.Get("/user/signin", user.Signin)
	//api.Delete("/user/:id/goods", user.Delete)
	//api.Post("/user", user.Create)

}
