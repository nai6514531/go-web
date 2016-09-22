package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/smart-cinema/src/server/enity"
	"maizuo.com/smart-cinema/src/server/util"
	"maizuo.com/smart-cinema/src/server/service"
	"maizuo.com/smart-cinema/src/server/model"
)

var (
	hall_msg = map[string]string {
		"01060101": "请求参数异常",

		"01060200": "拉取影厅订单信息列表成功",
		"01060201": "拉取影厅订单信息列表失败",

		"01060300": "拉取影厅小票信息列表成功",
		"01060301": "拉取影厅小票信息列表失败",
	}
)

type HallController struct {
}


func (self *HallController) Trade(ctx *iris.Context) {
	tradeService := &service.TradeService{}
	tradeNos := []string{}
	tradeList := &[]*model.Trade{}
	resultMap := make(map[string]interface{})

	paramMap := ctx.URLParams()
	id, err := ctx.ParamInt("id")
	start := util.StringToInt(paramMap["start"])
	limit := util.StringToInt(paramMap["limit"])
	scheduleId := util.StringToInt(paramMap["schedule_id"])
	at := paramMap["at"]
	if start >0 {
		start = start - 1
	}
	if limit == 0 {
		limit = util.GetMaxInt()
	}

	if err != nil || at == "" || scheduleId == 0{
		ctx.JSON(iris.StatusOK, &enity.Result{"01060101", nil, hall_msg["01060101"]})
		return
	}

	list, err := tradeService.BasicByHall(id, scheduleId, at, start, limit)
	if err != nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"01060201", nil, hall_msg["01060201"]})
		return
	}

	for _, trade := range *list {
		tradeNos = append(tradeNos, trade.TradeNo)
	}
	if len(tradeNos) != 0 {
		tradeList, _ = tradeService.BasicListByTradeNo(tradeNos)
	}

	resultMap["root"] = tradeList
	resultMap["total"], _ = tradeService.TotalByHallId(id, scheduleId, at)

	ctx.JSON(iris.StatusOK, &enity.Result{"01060200", resultMap, hall_msg["01060200"]})
}



