package web

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/controller/web"
	"maizuo.com/soda-manager/src/server/enity"
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

	iris.Get("/ip-test", func(ctx *iris.Context) {

		type IP struct {
			LocalAddr     string
			RemoteAddr    string
			RequestIP     string
			XForwardedFor string
			XRealIP       string
		}

		ip := &IP{
			ctx.LocalAddr().String(),
			ctx.RemoteAddr(),
			ctx.RequestIP(),
			ctx.RequestHeader("X-Forwarded-For"),
			ctx.RequestHeader("X-Real-IP"),
		}

		result := &enity.Result{"0", ip, "", }

		ctx.JSON(iris.StatusOK, result)
	})

}
