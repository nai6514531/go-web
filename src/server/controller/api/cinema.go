package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/smart-cinema/src/server/enity"
	"maizuo.com/smart-cinema/src/server/model"
	"maizuo.com/smart-cinema/src/server/service"
	"strconv"
	"maizuo.com/smart-cinema/src/server/common"
)

var (
	cinema_msg = map[string]string{
		"01010101": "请求参数异常",

		"01010200": "拉取商品信息成功",
		"01010201": "拉取商品信息失败",

		"01010300": "拉取影院信息成功",
		"01010301": "拉取影院信息失败",

		"01010400": "拉取影院订单信息成功",
		"01010401": "拉取影院订单信息失败",
	}
)

type CinemaController struct {
}

func (self *CinemaController) Goods(ctx *iris.Context) {
	goodsService := &service.GoodsService{}
	var err error
	var list *[]*model.Goods
	cinemaId, err := strconv.Atoi(ctx.Param("id"))
	filter := ctx.URLParam("filter")
	if err != nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"01010101", nil, cinema_msg["01010101"]})
		return
	}
	if filter == "full" {
		list, err = goodsService.DetailListByCinemaId(cinemaId)
	} else {
		list, err = goodsService.BasicListByCinemaId(cinemaId)
	}
	if err != nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"010102001", nil, cinema_msg["01010201"]})
		return
	}
	ctx.JSON(iris.StatusOK, &enity.Result{"01010200", list, cinema_msg["01010200"]})
}

func (self *CinemaController) Detail(ctx *iris.Context) {
	var cinema *model.Cinema
	var err error
	cinemaService := &service.CinemaService{}
	cinemaId, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"01010101", nil, cinema_msg["01010101"]})
		return
	}
	filter := ctx.URLParam("filter")
	if filter == "full" {
		cinema, err = cinemaService.Detail(cinemaId)
	} else {
		cinema, err = cinemaService.Basic(cinemaId)
	}
	if err != nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"01010301", nil, cinema_msg["01010301"]})
		return
	}
	ctx.JSON(iris.StatusOK, &enity.Result{"01010300", cinema, cinema_msg["01010300"]})
}


/*func (self *CinemaController) Trade(ctx *iris.Context) {
	hallService := &service.HallService{}
	at := ctx.Param("at")
	cinemaId, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"01010101", nil, cinema_msg["01010101"]})
		return
	}
	list, err := hallService.DetailListByCinemaId(cinemaId, at)
	if err != nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"01010401", nil, cinema_msg["01010401"]})
		return
	}
	ctx.JSON(iris.StatusOK, &enity.Result{"01010400", list, cinema_msg["01010400"]})
}*/

/**
	查询影院各影厅订单
 */
func (self *CinemaController) Trade(ctx *iris.Context) {
	tradeSercive := &service.TradeService{}
	tradeNos := []string{}
	tradeList := &[]*model.Trade{}

	at := ctx.URLParam("at")
	id, err := ctx.ParamInt("id")
	if err != nil || at == ""{
		ctx.JSON(iris.StatusOK, &enity.Result{"01010101", nil, cinema_msg["01010101"]})
		return
	}

	list, err := tradeSercive.BasicByCinemaIdAndAt(id, at)
	for _, trade := range *list {
		tradeNos = append(tradeNos, trade.TradeNo)
	}
	common.Logger.Debug("tradeNos=========", tradeNos)
	if len(tradeNos) != 0 {
		tradeList, err = tradeSercive.DetailByTradeNos(tradeNos)
		if err != nil {
			ctx.JSON(iris.StatusOK, &enity.Result{"01010401", nil, cinema_msg["01010401"]})
			return
		}
	}


	ctx.JSON(iris.StatusOK, &enity.Result{"01010400", tradeList, cinema_msg["01010400"]})
}

//func (self *CinemaController) Update(tradeNos []string, status int) (ctx *iris.Context) {
//	tradeService := &service.TradeService{}
//	tradeService.BasicListByTradeNo()
//}
