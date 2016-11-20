package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/common"
)

var (
	trade_msg = map[string]string{
		"01080100": "拉取模块数据成功",
		"01080200": "拉取模块数据失败",

	}
)

type TradeController struct {
}

/*
模块查询&洗衣查询
 */
func (self *TradeController) Basic(ctx *iris.Context) {
	result := &enity.Result{}
	tradeService := service.TradeService{}
	serialNumber := ctx.URLParam("serial-number")
	account := ctx.URLParam("account")
	list, err := tradeService.BasicOfDevice(serialNumber, account)
	if err != nil {
		result = &enity.Result{"01080101", err.Error(), trade_msg["01080101"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01080100", &list, statis_msg["01080100"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

