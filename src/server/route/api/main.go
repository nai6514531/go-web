package api

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/controller/api"
)

func Api() {

	var (
		user = &controller.UserController{}
		region = &controller.RegionController{}
		device = &controller.DeviceController{}
		school = &controller.SchoolController{}
		referenceDevice = &controller.ReferenceDeviceController{}
		dailyBill = &controller.DailyBillController{}
		sync = &controller.SyncController{}
		statis = &controller.StatisController{}
		trade = &controller.TradeController{}
	)

	api := iris.Party("/api", func(ctx *iris.Context) {
		ctx.Next()
	})

	//api.Use(common.CORS)

	api.Post("/signin", user.Signin)
	api.Get("/signout", user.Signout)

	api.Post("/daily-bill/alipay/notification", dailyBill.Notification)

	api.UseFunc(common.RequireSignin)

	api.Get("/stat/recharge", dailyBill.Recharge)
	api.Get("/stat/consume", dailyBill.Consume)
	api.Get("/stat/daily-bill", dailyBill.SumByDate)
	api.Get("/stat/signin-user", user.SignInUser)

	api.Get("/sync/user", sync.SyncUser)
	api.Get("/sync/user-role", sync.SyncUserRole)
	api.Get("/sync/user-cash-account", sync.SyncUserCashAccount)
	api.Get("/sync/device", sync.SyncDevice)
	api.Get("/sync/daily-bill", sync.SyncDailyBill)
	api.Get("/sync/daily-bill-detail", sync.SyncDailyBillDetail)
	api.Get("/sync/user-all", sync.SyncAllUserAndRel)

	api.Get("/user", user.ListByParent)
	api.Get("/user/:id/device-total", user.BasicWithDeviceTotal)
	api.Post("/user", user.Create)
	api.Put("/user-password", user.Password)
	api.Put("/user/:id", user.Update)
	api.Get("/user/:id", user.Basic)
	api.Get("/user/:id/device", user.IsMeOrSub,user.DeviceList)
	api.Get("/user/:id/school", user.IsMeOrSub, user.SchoolList)
	api.Get("/user/:id/school/:schoolId/device", user.IsMeOrSub, user.DeviceOfSchool)
	api.Get("/user/:id/menu", user.Menu)
	api.Get("/user/:id/permission", user.Permission)
	api.Get("/user-detail/:account", user.DetailByAccount)

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
	api.Patch("/device/:id/reset", device.OwnToMeOrTest, device.Reset)
	api.Post("/device", device.Create)
	api.Put("/device/:id", device.OwnToMeOrTest, device.Update)
	api.Put("/device/:id/serial-number", device.UpdateBySerialNumber)
	api.Patch("/device/:id/status", device.OwnToMeOrTest, device.UpdateStatusLimiter, device.UpdateStatus)
	api.Patch("/device/:id/pulse-name", device.OwnToMeOrTest, device.UpdatePulseName)
	api.Put("/device-unlock", device.UnLock)
	api.Put("/device-assign", device.Assign)


	api.Get("/reference-device", referenceDevice.List)
	api.Get("/reference-device/:id", referenceDevice.Basic)

	api.Get("/daily-bill", dailyBill.List)
	api.Get("/daily-bill-detail", dailyBill.DetailList)
	api.Get("/daily-bill/apply", dailyBill.Apply)
	api.Put("/daily-bill/batch-pay", dailyBill.BatchPay)
	api.Post("/daily-bill/cancel", dailyBill.CancelBatchAliPay)
	api.Get("/daily-bill/mark", dailyBill.Mark)
	api.Get("/daily-bill/device/:serialNumber", device.DailyBill)
	api.Get("/daily-bill/export", dailyBill.Export)

	api.Get("/statis/consume", statis.Consume)
	api.Get("/statis/operate", statis.Operate)
	api.Get("/statis/device", statis.Device)
	api.Get("/stat/daily-pay", statis.DailyPay)
	api.Get("/trade", trade.Basic)
	api.Get("/trade/refund", trade.Refund)
}
