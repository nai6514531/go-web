package server

import (
	"gopkg.in/kataras/iris.v4"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/route/api"
	"maizuo.com/soda-manager/src/server/route/web"
	"gopkg.in/kataras/go-template.v0/html"
)

func SetUpServer() {

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
