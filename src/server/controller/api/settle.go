package controller

import (
	"github.com/spf13/viper"
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/kit/functions"
)

type SettleController struct {
}

// 获取可提现金额及其明细信息
func (self *SettleController) SettlementDetails(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	userCashAccountService := &service.UserCashAccountService{}
	userId := ctx.Session().Get(viper.GetString("server.session.user.id")).(int)
	amount, count, err := dailyBillService.CountAllocatableMoneyByUserId(userId)
	if err != nil {
		result := &enity.Result{"01110001", err, daily_bill_msg["01110001"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	userCashAccount, err := userCashAccountService.BasicByUserId(userId)
	if err != nil {
		result := &enity.Result{"01110001", err, daily_bill_msg["01110001"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx, result)
		return
	}
	// 默认值用支付宝低于200的情况
	cast, rate := viper.GetInt("bill.aliPay.cast"), viper.GetInt("bill.aliPay.rate")
	if userCashAccount.Type == 1 {
		// 支付宝大于200的情况
		if amount > viper.GetInt("bill.aliPay.borderValue") {
			rate = 1
			cast = int(functions.Round(float64(amount * rate)/100.00,0))//四舍五入
		}
	} else {
		// 微信
		rate = viper.GetInt("bill.wechat.rate")
		cast = int(functions.Round(float64(amount * rate)/100.00,0))//四舍五入
	}
	result := &enity.Result{Status: "01110000", Data: map[string]interface{}{
		"totalAmount": amount,
		"count":       count,
		"cast":        cast,
	}, Msg: daily_bill_msg["01110000"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx, result)
	return
}
