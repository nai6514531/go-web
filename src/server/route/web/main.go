package web

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/controller/web"
)

func Web() {

	var (
		web = &controller.WebController{}
	)

	iris.Get("/", web.Index)
	iris.Get("/signin", web.Signin)
	iris.Get("/stat", web.Stat)
	iris.Get("/captcha.png", web.Captcha)

	iris.Get("/500", func(ctx *iris.Context) {
		panic(500)
		ctx.EmitError(iris.StatusInternalServerError)
	})

}
