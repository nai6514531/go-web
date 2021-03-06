package api

import (
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/controller/api"
)

func Api() {

	var (
		user            = &controller.UserController{}
		region          = &controller.RegionController{}
		device          = &controller.DeviceController{}
		school          = &controller.SchoolController{}
		referenceDevice = &controller.ReferenceDeviceController{}
		dailyBill       = &controller.DailyBillController{}
		statis          = &controller.StatisController{}
		trade           = &controller.TradeController{}
		sms             = &controller.SmsController{}
		bill            = &controller.BillController{}
		settle          = &controller.SettleController{}
		auth            = &controller.AuthController{}
	)

	api := iris.Party("/api", func(ctx *iris.Context) {
		ctx.Next()
	})

	//api.Use(common.CORS)
	// api.UseFunc(common.CORS.Serve)
	api.Options("/wechat/key/:key", common.CORS.Serve)
	api.Post("/signin", user.Signin)
	api.Get("/signout", user.Signout)
	api.Post("/user/reset", user.ForgetPassword)
	api.Post("/sms/verity", sms.Verify)
	api.Post("/reset-sms", sms.ResetSmsCodes)

	api.Post("/daily-bill/alipay/notification", dailyBill.Notification)
	api.Post("/wechat/key/:key", common.CORS.Serve, auth.UpdateWechatKey)

	api.UseFunc(common.RequireSignin)

	api.Get("/stat/recharge", dailyBill.Recharge)
	api.Get("/stat/consume", dailyBill.Consume)
	api.Get("/stat/daily-bill", dailyBill.SumByDate)
	api.Get("/stat/signin-user", user.SignInUser)

	// api.Get("/sync/user", sync.SyncUser)
	// api.Get("/sync/user-role", sync.SyncUserRole)
	// api.Get("/sync/user-cash-account", sync.SyncUserCashAccount)
	// api.Get("/sync/device", sync.SyncDevice)
	// api.Get("/sync/daily-bill", sync.SyncDailyBill)
	// api.Get("/sync/daily-bill-manual", sync.SyncDailyBillManual)
	// api.Get("/sync/daily-bill-detail", sync.SyncDailyBillDetail)
	// api.Get("/sync/user-all", sync.SyncAllUserAndRel)

	api.Get("/user", user.ListByParent)
	api.Get("/user/:id/device-total", user.BasicWithDeviceTotal)
	api.Post("/user", user.Create)
	api.Put("/user-password", user.Password)
	api.Post("/user/reset-password", user.ResetPassword)
	api.Put("/user/:id", user.Update)
	api.Get("/user/:id", user.Basic)
	api.Get("/user/:id/device", user.IsMeOrSub, user.DeviceList)
	api.Get("/user/:id/school", user.IsMeOrSub, user.SchoolList)
	api.Get("/user/:id/school/:schoolId/device", user.IsMeOrSub, user.DeviceOfSchool)
	api.Get("/user/:id/menu", user.Menu)
	api.Get("/user/:id/permission", user.Permission)
	api.Get("/permission/is-chipcard-operator", user.ChipcardOper)
	api.Get("/user-detail/:account", user.DetailByAccount)

	api.Get("/school/:id", school.Basic)
	api.Get("/school", school.List)

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
	api.Post("/device/:id/reset", device.OwnToMeOrTest, device.Reset)
	api.Post("/device", device.Create)
	api.Put("/device/:id", device.OwnToMeOrTest, device.Update)
	api.Put("/device-batch", device.OwnToMeOrTestBySerialNumbers, device.BatchUpdate)
	api.Put("/device/:id/serial-number", device.UpdateBySerialNumber)
	api.Post("/device/:id/status", device.OwnToMeOrTest, device.UpdateStatusLimiter, device.UpdateStatus)
	api.Post("/device/:id/pulse-name", device.OwnToMeOrTest, device.UpdatePulseName)
	api.Put("/device-unlock", device.UnLock)
	api.Put("/device-lock", device.Lock)
	api.Put("/device-assign", device.Assign)
	api.Post("/device-step", device.ResetPasswordStep)
	api.Put("/device-token-reset", device.ResetToken)

	api.Get("/reference-device", referenceDevice.List)
	api.Get("/reference-device/:id", referenceDevice.Basic)

	api.Get("/daily-bill", dailyBill.List)
	api.Get("/daily-bill-detail", dailyBill.DetailList)
	// api.Put("/daily-bill/set-paid-up", dailyBill.SetPaidUp)
	// api.Put("/daily-bill/batch-pay", dailyBill.BatchPay)
	// api.Put("/daily-bill/bank-bill/:id/cancel", dailyBill.CancelBankBill)
	// api.Post("/daily-bill/cancel", dailyBill.CancelBatchAliPay)
	// api.Get("/daily-bill/mark", dailyBill.Mark)
	api.Get("/daily-bill/device/:serialNumber", device.DailyBill)
	api.Get("/daily-bill/export", dailyBill.Export)

	api.Get("/statis/consume", statis.Consume)
	api.Get("/statis/operate", statis.Operate)
	api.Get("/statis/device", statis.Device)
	api.Get("/stat/daily-pay", statis.DailyPay)
	api.Get("/stat/balance", statis.Balance)
	api.Get("/stat/failed-trade", statis.FailedTrade)
	api.Get("/stat/user-count", statis.Count)

	api.Get("/trade", trade.Basic)
	api.Get("/trade/refund", trade.Refund)
	api.Get("/chipcard/recharge", trade.ListRecharges)
	api.Post("/chipcard/recharge", trade.Recharge)
	api.Get("/chipcard", trade.ChipcardBasic)
	api.Post("/chipcard/relation", trade.ChangeCBRels)

	api.Get("/settlement/detail", settle.SettlementDetails)

	api.Get("/bill", bill.List)
	api.Post("/bill", bill.InsertOrUpdate)
	api.Get("/bill/:billId", bill.DetailsByBillId)
	api.Get("/bill/:billId/cast", bill.CastByBillId)

	api.Post("/wechat/actions/create/key", auth.CreateKey)
	api.Get("/wechat/key/:key", auth.CheckKeyStatus)
}
