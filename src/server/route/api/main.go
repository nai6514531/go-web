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
		user            = &controller.UserController{}
		region          = &controller.RegionController{}
		device          = &controller.DeviceController{}
		referenceDevice = &controller.ReferenceDeviceController{}
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

	api.Post("/user/signin", user.Signin)
	api.Get("/user/signout", user.Signout)
	api.Get("/user/verificode", user.SendVerifiCode)
	api.Get("/user", user.ListByParent)
	api.Get("/user/:id", user.Basic)

	api.Get("/province", region.Province)
	api.Get("/province/:id", region.ProvinceDetail)
	api.Get("/province/:id/city", region.CityOfProvince)
	api.Get("/province/:id/school", region.SchoolOfProvince)
	api.Get("/city", region.City)
	api.Get("/city/:id", region.CityDetail)
	api.Get("/city/:id/district", region.DistrictOfCity)
	api.Get("/district/:id", region.DistrictDetail)

	api.Get("/device", device.List)

	api.Get("/reference-device", referenceDevice.List)
}
