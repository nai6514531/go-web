package api

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/controller/api"
)

func Api() {

	api := iris.Party("/api", func(ctx *iris.Context) {
		println("Middleware for all /api!")
		println("from ", ctx.MethodString(), ctx.PathString())
		ctx.Response.Header.Set("Server", ctx.RemoteAddr())
		ctx.Next()
	})

	link := iris.Party("/api/link", func(ctx *iris.Context) {
		println("Middleware for all /api/link")
		println("from ", ctx.MethodString(), ctx.PathString())
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
		sync            = &controller.SyncController{}
	)

	link.Post("/signin", user.Signin)
	link.Post("/signout", user.Signout)
	//api.Get("/link/verificode", user.SendVerifiCode)

	api.Get("/sync/user", sync.SyncUser)
	api.Get("/sync/user-role", sync.SyncUserRole)
	api.Get("/sync/user-cash-account", sync.SyncUserCashAccount)
	api.Get("/sync/device", sync.SyncDevice)
	api.Get("/sync/daily-bill", sync.SyncDailyBill)

	api.UseFunc(common.CheckHasLogin)

	api.Get("/user", user.ListByParent)
	api.Get("/user/:id/user-device-info", user.BasicWithDeviceInfo)
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
	api.Get("/device/:id", common.CheckDeviceId, device.Basic)
	api.Delete("/device/:id", common.CheckDeviceId, device.Delete)
	api.Post("/device", device.Create)
	api.Put("/device/:id", common.CheckDeviceId, device.Update)
	api.Put("/device/:id/serial-number", common.CheckDeviceId, device.UpdateBySerialNumber)
	api.Patch("/device/:id/status", common.CheckDeviceId, device.UpdateStatus)
	api.Patch("/device/:id/pulse-name", common.CheckDeviceId, device.UpdatePulseName)

	api.Get("/reference-device", referenceDevice.List)
	api.Get("/reference-device/:id", referenceDevice.Basic)

}
