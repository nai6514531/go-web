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
		common          = &controller.CommonController{}
		user            = &controller.UserController{}
		region          = &controller.RegionController{}
		device          = &controller.DeviceController{}
		school          = &controller.SchoolController{}
		referenceDevice = &controller.ReferenceDeviceController{}
	)

	api.UseFunc(func(ctx *iris.Context) {
		//your authentication logic here...
		println("from ", ctx.MethodString(), ctx.PathString())
		authorized := true
		if authorized {
			ctx.Next()
		} else {
			ctx.Text(401, ctx.PathString()+" is not authorized for you")
		}
	})
	api.Post("/link/signin", user.Signin)
	api.Get("/link/signout", user.Signout)
	//api.Get("/link/verificode", user.SendVerifiCode)

	api.Get("/user", user.ListByParent)
	api.Post("/user", user.Create)
	api.Put("/user/:id", common.CheckUserId, user.Update)
	api.Get("/user/:id", common.CheckUserId, user.Basic)
	api.Get("/user/:id/device", common.CheckUserId, user.DeviceList)
	api.Get("/user/:id/school", common.CheckUserId, user.SchoolList)
	api.Get("/user/:id/school/:schoolId/device", common.CheckUserId, user.DeviceOfSchool)
	api.Get("/user/:id/menu", common.CheckUserId, user.Menu)
	api.Get("/user/:id/permission", common.CheckUserId, user.Permission)

	api.Get("/school")
	api.Get("/school/:id", school.Basic)

	api.Get("/province", region.Province)
	api.Get("/province/:id", region.ProvinceDetail)
	api.Get("/province/:id/city", region.CityOfProvince)
	api.Get("/province/:id/school", region.SchoolOfProvince)
	api.Get("/city", region.City)
	api.Get("/city/:id", region.CityDetail)
	api.Get("/city/:id/district", region.DistrictOfCity)
	api.Get("/district/:id", region.DistrictDetail)

	api.Get("/device", device.List)
	api.Get("/device/:id", device.Basic)
	api.Delete("/device/:id", device.Delete)
	api.Post("/device", device.Create)
	api.Put("/device/:id", device.Update)
	api.Put("/device/:id/serial-number", device.UpdateBySerialNumber)
	api.Patch("/device/:id/status", device.UpdateStatus)
	api.Patch("/device/:id/pulse-name", device.UpdatePulseName)

	api.Get("/reference-device", referenceDevice.List)

}
