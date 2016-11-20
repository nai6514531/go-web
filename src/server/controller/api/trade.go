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
		"01080101": "拉取模块数据失败",
		"01080102": "缺少参数",

		"01080200": "退款成功",
		"01080201": "退款失败",
		"01080202": "参数错误",
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
	if serialNumber == "" && account == "" {
		result = &enity.Result{"01080102", nil, trade_msg["01080102"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
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

func (self *TradeController) refund(ctx *iris.Context) {
	result := &enity.Result{}
	tradeService := *service.TradeService{}
	washId, err := ctx.URLParamInt("washId")
	if err != nil {
		result = &enity.Result{"01080202", nil, trade_msg["01080202"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	account := ctx.URLParam("account")
	if washId < 0 || account == "" {
		result = &enity.Result{"01080202", nil, trade_msg["01080202"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	_, err = tradeService.Refund(washId, account)
	if err != nil {
		result = &enity.Result{"01080201", err.Error(), trade_msg["01080201"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01080200", nil, statis_msg["01080200"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}
