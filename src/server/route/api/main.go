package api

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/controller/api"
)

func Hello(ctx *iris.Context) {
	ctx.Write("hello,%s", ctx.Param("name"))
}
func Api() {

	api := iris.Party("/api", func(ctx *iris.Context) {
		println("Middleware for all party's routes!")
		ctx.Response.Header.Set("Server", ctx.RemoteAddr())
		ctx.Next()
	})

	var (
		user = &controller.UserController{}
	)

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

	api.Get("/user/aaa/:name/tttt", Hello)
	api.Get("/user/singin", user.Signin)
	//api.Delete("/user/:id/goods", user.Delete)
	//api.Post("/user", user.Create)

}
