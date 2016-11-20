package controller

import (
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/common"
)

var (
	statis_msg = map[string]string{
		"01070100": "拉取消费统计数据成功",
		"01070101": "拉取消费统计数据失败",

		"01070200": "拉取经营统计数据成功",
		"01070201": "拉取经营统计数据失败",

		"01070300": "拉取模块统计数据成功",
		"01070301": "拉取模块统计数据失败",
	}
)

type StatisController struct {
}

/*
消费统计
 */
func (self *StatisController) Consume(ctx *iris.Context) {
	result := &enity.Result{}
	statisService := &service.StatisService{}
	userId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	//month := ctx.URLParam("month")
	date := ctx.URLParam("date")
	common.Logger.Debugln("date============", date)
	list, err := statisService.Consume(userId, date)
	if err != nil {
		result = &enity.Result{"01070101", err.Error(), statis_msg["01070101"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	result = &enity.Result{"01070100", &list, statis_msg["01070100"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

/*
经营统计
 */
func (self *StatisController) Operate(ctx *iris.Context) {
	result := &enity.Result{}
	statisService := &service.StatisService{}
	date := ctx.URLParam("date")
	common.Logger.Debugln("date============", date)
	list, err := statisService.Operate(date)
	if err != nil {
		result = &enity.Result{"01070201", err.Error(), statis_msg["01070201"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	result = &enity.Result{"01070200", &list, statis_msg["01070200"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

/*
模块统计
 */
func (self *StatisController) Device(ctx *iris.Context) {
	result := &enity.Result{}
	statisService := &service.StatisService{}
	userId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	date := ctx.URLParam("date")
	serialNumber := ctx.URLParam("serial-number")
	list, err := statisService.Device(userId, serialNumber, date)
	if err != nil {
		result = &enity.Result{"01070301", err.Error(), statis_msg["01070301"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	result = &enity.Result{"01070300", &list, statis_msg["01070300"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}
