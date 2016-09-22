package server

import (
	"github.com/iris-contrib/middleware/recovery"
	"github.com/iris-contrib/template/html"
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"maizuo.com/smart-cinema/src/server/common"
	"maizuo.com/smart-cinema/src/server/route/api"
	"maizuo.com/smart-cinema/src/server/route/web"
)

func SetUpServer() {

	iris.Use(recovery.New(iris.Logger))

	isDevelopment := viper.GetBool("isDevelopment")
	staticSystemPath := viper.GetString("staticSystemPath")
	staticRequestPath := viper.GetString("staticRequestPath")
	templateServe := viper.GetString("templateServe")
	templateSuffix := viper.GetString("templateSuffix")
	faviconPath := viper.GetString("faviconPath")

	iris.UseTemplate(html.New()).Directory(templateServe, templateSuffix)
	iris.Config.IsDevelopment = isDevelopment
	iris.StaticServe(staticSystemPath, staticRequestPath)
	iris.Favicon(faviconPath)

	api.Api()

	web.Web()

	iris.OnError(iris.StatusInternalServerError, func(ctx *iris.Context) {
		ctx.Write("CUSTOM 500 INTERNAL SERVER ERROR PAGE!")
		common.Logger.Printf("http status: 500 happened!~")
	})

	iris.OnError(iris.StatusNotFound, func(ctx *iris.Context) {
		ctx.Write("CUSTOM 404 NOT FOUND ERROR PAGE")
		common.Logger.Printf("http status: 404 happened!")
	})

	iris.OnError(iris.StatusTooManyRequests, func(ctx *iris.Context) {
		ctx.Write("CUSTOM 429 TOO MANY REQUESTS ERROR PAGE")
		common.Logger.Printf("http status: 429 happened!")
	})

	iris.Listen(viper.GetString("server.host") + ":" + viper.GetString("server.port"))

}
