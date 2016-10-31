package server

import (
	"github.com/iris-contrib/template/html"
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/route/api"
	"maizuo.com/soda-manager/src/server/route/web"
)

func SetUpServer() {

	//iris.Use(recovery.Handler)

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

	iris.Listen(viper.GetString("server.host") + ":" + viper.GetString("server.port"))

}
