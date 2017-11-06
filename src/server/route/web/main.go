package web

import (
	"github.com/spf13/viper"
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/controller/web"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/kit/common"
)

func Web() {

	var (
		web = &controller.WebController{}
	)

	iris.Get("/", web.Index)
	iris.Get("/signin", web.Signin)
	iris.Get("/captcha.png", web.Captcha)

	iris.Get("/500", func(ctx *iris.Context) {
		panic(500)
		ctx.EmitError(iris.StatusInternalServerError)
	})

	iris.StaticFS(viper.GetString("export.loadsPath"), "."+viper.GetString("export.loadsPath"), 1)

	iris.Get("/ip-test", func(ctx *iris.Context) {

		type IP struct {
			LocalAddr     string
			RemoteAddr    string
			RequestIP     string
			XForwardedFor string
			XRealIP       string
			ExternalIP    string
		}

		ip := &IP{
			ctx.LocalAddr().String(),
			ctx.RemoteAddr(),
			ctx.RequestIP(),
			ctx.RequestHeader("X-Forwarded-For"),
			ctx.RequestHeader("X-Real-IP"),
			common.CommonKit{}.ExternalIP(),
		}

		result := &enity.Result{"0", ip, ""}

		ctx.JSON(iris.StatusOK, result)
	})

	iris.Get("/robots.txt", func(ctx *iris.Context) {
		ctx.Render("robots.html", map[string]interface{}{"title": "Robots"})
	})

}
