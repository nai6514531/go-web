package api

import (
	"github.com/kataras/iris"
	"maizuo.com/smart-cinema/src/server/controller/api"
)

func Api() {

	api := iris.Party("/api", func(ctx *iris.Context) {
		println("Middleware for all party's routes!")
		ctx.Response.Header.Set("Server", ctx.RemoteAddr())
		ctx.Next()
	})

	var (
		user = &controller.UserController{}
		device = &controller.DeviceController{}
		cinema = &controller.CinemaController{}
		region = &controller.RegionController{}
		goods = &controller.GoodsController{}
		trade = &controller.TradeController{}
		hall = &controller.HallController{}
	)

	api.UseFunc(func(ctx *iris.Context) {
		//your authentication logic here...
		println("from ", ctx.PathString())
		authorized := true
		if authorized {
			ctx.Next()
		} else {
			ctx.Text(401, ctx.PathString() + " is not authorized for you")
		}
	})

	api.Get("/user/:id", user.Basic)
	api.Delete("/user/:id", user.Delete)
	api.Post("/user", user.Create)

	api.Get("/region/province", region.Province)
	api.Get("/region/province/:id", region.ProvinceDetail)
	api.Get("/region/province/:id/city", region.CitiesOfProvince)

	api.Get("/region/city", region.City)
	api.Get("/region/city/:id", region.CityDetail)
	api.Get("/region/city/:id/district", region.DistrictsOfCity)

	api.Get("/region/district/:id", region.DistrictDetail)

	api.Get("/device/:id", device.Detail)

	api.Get("/cinema/:id", cinema.Detail)
	api.Get("/cinema/:id/goods", cinema.Goods)
	api.Get("/cinema/:id/trade", cinema.Trade)

	api.Get("/hall/:id/trade", hall.Trade)

	api.Get("/goods/:id", goods.Detail)
	api.Get("/goods/:id/favor", goods.Favor)
	api.Get("/goods/:id/cate", goods.Cate)
	api.Get("/goods/:id/label", goods.Label)

	api.Post("/trade", trade.Create)
	api.Post("/pay/unifiedorder", trade.Unifiedorder)
	api.Get("/pay/unifiedorder", trade.CreateUnifiedorder)
	api.Get("/trade/temp/:no", trade.Temp)

	api.Post("/trade/wechat/callback", trade.WeChatCallBack)
	api.Post("/trade/wechat/async-notification", trade.WeChataSyncNotification)
}
