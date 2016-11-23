package controller

import (
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/common"
	"strconv"
)

var (
	statis_msg = map[string]string{
		"01070100": "拉取消费统计数据成功",
		"01070101": "拉取消费统计数据失败",

		"01070200": "拉取经营统计数据成功",
		"01070201": "拉取经营统计数据失败",

		"01070300": "拉取模块统计数据成功",
		"01070301": "拉取模块统计数据失败",
		"01070302": "参数错误",

		"01070400": "拉取每日结账数据成功",
		"01070401": "拉取每日结账数据失败",
		"01070402": "支付宝用户为空",
		"01070403": "银行用户为空",
		"01070404": "支付宝每日结账为空",
		"01070405": "银行每日结账为空",
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
	serialNumber := ctx.URLParam("serialNumber")
	if (date != "" && serialNumber == "") || (date == "" && serialNumber != "") {
		result = &enity.Result{"01070302", nil, statis_msg["01070302"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
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

func (self *StatisController) DailyPay(ctx *iris.Context) {
	userCashAccountService := &service.UserCashAccountService{}
	dailyBillServie := &service.DailyBillService{}
	result := &enity.Result{}
	data := make(map[string]interface{}, 0)
	alipayUserIds := make([]string, 0)
	bankUserIds := make([]string, 0)
	alipayAccount, err := userCashAccountService.BasicMapByType(1)        //支付宝
	if err != nil {
		result = &enity.Result{"01070402", err.Error(), daily_bill_msg["01070402"]}
		common.Log(ctx, result)
	}
	bankAccount, err := userCashAccountService.BasicMapByType(3)           //银行
	if err != nil {
		result = &enity.Result{"01070403", err.Error(), daily_bill_msg["01070403"]}
		common.Log(ctx, result)
	}
	for _, _account := range alipayAccount {
		alipayUserIds = append(alipayUserIds, strconv.Itoa(_account.UserId))
	}
	for _, _account := range bankAccount {
		bankUserIds = append(bankUserIds, strconv.Itoa(_account.UserId))
	}
	if len(alipayUserIds) > 0 {
		alipay, err := dailyBillServie.SumByDate(alipayUserIds...)
		if err != nil {
			result = &enity.Result{"01070404", nil, daily_bill_msg["01070404"]}
			common.Log(ctx, result)
		}
		data["alipay"] = alipay
	}
	if len(bankUserIds) > 0 {
		bank, err := dailyBillServie.SumByDate(bankUserIds...)
		if err != nil {
			result = &enity.Result{"01070405", nil, daily_bill_msg["01070405"]}
			common.Log(ctx, result)
		}
		data["bank"] = bank
	}
	result = &enity.Result{"01070400", &data, statis_msg["01070400"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}
