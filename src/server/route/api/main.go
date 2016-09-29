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
		region = &controller.RegionController{}
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

	api.Get("/region/province",region.Province)
	api.Get("/region/province/:id", region.ProvinceDetail)
	api.Get("/region/province/:id/city",region.CityOfProvince)
	api.Get("/region/city", region.City)
	api.Get("/region/city/:id", region.CityDetail)
	api.Get("/region/city/:id/district",region.DistrictOfCity)
	api.Get("/region/district/:id", region.DistrictDetail)

}
