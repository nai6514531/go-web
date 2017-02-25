package controller

import (
	"gopkg.in/kataras/iris.v4"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/common"
	"time"
)

var (
	statis_msg = map[string]string{
		"01070100": "拉取消费统计数据成功",
		"01070101": "无消费统计数据",
		"01070102": "拉取拉取用户设备数据失败",

		"01070200": "拉取经营统计数据成功",
		"01070201": "无经营统计数据",

		"01070300": "拉取模块统计数据成功",
		"01070301": "模块统计无数据",
		"01070302": "参数错误",

		"01070400": "拉取每日结账数据成功",
		"01070401": "无每日结账数据",
		"01070402": "支付宝用户为空",
		"01070403": "银行用户为空",
		"01070404": "支付宝每日结账为空",
		"01070405": "银行每日结账为空",

		"01070500": "拉取'充值/消费/余额统计'数据成功",
		"01070501": "拉取'余额统计'数据失败",
		"01070502": "拉取'充值统计'数据失败",
		"01070503": "拉取'消费统计'数据失败",
		"01070504": "拉取'余额总数'数据失败",
		"01070505": "拉取'充值总数'数据失败",
		"01070506": "拉取'消费总数'数据失败",

		"01070600": "拉取'下单失败统计'数据成功",
		"01070601": "拉取'下单失败统计'数据失败",

		"01070700": "拉取用户总数成功",
		"01070701": "拉取用户总数失败",
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
	userId,_ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	date := ctx.URLParam("date")
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
	var list interface{}
	var err error
	if len(date)==7|| len(date)==10{
		list, err = statisService.Operate(date)
	}else {
		list, err = statisService.MonthlyOperate()
	}
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
	userId ,_:= ctx.Session().GetInt(viper.GetString("server.session.user.id"))
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
		result = &enity.Result{"01070301", err.Error(), statis_msg["01070301"]+":"+err.Error()}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	result = &enity.Result{"01070300", &list, statis_msg["01070300"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *StatisController) DailyPay(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	result := &enity.Result{}
	data := make(map[string]interface{}, 0)
	alipayBill,_:=dailyBillService.DailyBillByAccountType(1)
	bankBill,_:=dailyBillService.DailyBillByAccountType(3)
	data["alipay"]=alipayBill
	data["bank"]=bankBill
	result = &enity.Result{"01070400", &data, statis_msg["01070400"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *StatisController) Balance(ctx *iris.Context) {
	statisService := &service.StatisService{}
	list := make([]*map[string]interface{}, 0)
	result := &enity.Result{}
	start := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
	end := time.Now().Format("2006-01-02")
	rechargeMap, err := statisService.Recharge(start,end)
	if err != nil {
		result = &enity.Result{"01070502", err.Error(), statis_msg["01070502"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	consumptionMap, err := statisService.Consumption(start,end)
	if err != nil {
		result = &enity.Result{"01070503", err.Error(), statis_msg["01070503"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	m := make(map[string]interface{}, 0)
	m["date"] = "total"
	m["balance"], err = statisService.BalanceSum()
	if err != nil {
		result = &enity.Result{"01070504", err.Error(), statis_msg["01070504"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	m["recharge"], err = statisService.RechargeSum()
	if err != nil {
		result = &enity.Result{"01070505", err.Error(), statis_msg["01070505"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	m["consume"], err = statisService.ConsumptionSum()
	if err != nil {
		result = &enity.Result{"01070506", err.Error(), statis_msg["01070506"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	list = append(list, &m)
	for i:=1; i<=7; i++ {
		t,_:=time.Parse("2006-01-02",end)
		date := t.AddDate(0, 0, -i).Format("2006-01-02")
		m := make(map[string]interface{}, 0)
		m["date"] = date
		m["recharge"] = rechargeMap[date]
		m["consume"] = consumptionMap[date]
		m["balance"] =rechargeMap[date]-consumptionMap[date]
		list = append(list, &m)
	}
	result = &enity.Result{"01070500", &list, statis_msg["01070500"]}
	common.Log(ctx, nil)

	ctx.JSON(iris.StatusOK, result)
}

func (self *StatisController) FailedTrade(ctx *iris.Context) {
	staisService := &service.StatisService{}
	result := &enity.Result{}
	list, err := staisService.FailedTrade()
	if err != nil {
		result = &enity.Result{"01070601", err.Error(), statis_msg["01070601"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01070600", &list, statis_msg["01070600"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *StatisController) Count(ctx *iris.Context) {
	userService := &service.UserService{}
	result := &enity.Result{}
	count, err := userService.Count()
	if err != nil {
		result = &enity.Result{"01070701", err.Error(), statis_msg["01070701"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01070700", &count, statis_msg["01070700"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}
