package controller

import (
	"gopkg.in/kataras/iris.v4"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/common"
)

type SettleController struct {

}
/*{
    "status": 01110000,
    "data": {
        "totalAmount": 1000
        "count": 2  // 结算天数
    },
    "msg": "拉取可结算信息成功"
}
*/
// 获取可提现金额及其明细信息
func (self *SettleController) SettlementDetails(ctx *iris.Context){
	dailyBillService := &service.DailyBillService{}
	userCashAccountService := &service.UserCashAccountService{}
	userId := ctx.Session().Get(viper.GetString("server.session.user.id")).(int)
	amount,count,err := dailyBillService.CountAllocatableMoneyByUserId(userId)
	if err != nil  {
		common.Logger.Debugln("CountAllocatableMoney CountAllocatableMoneyByUserId error",err)
		ctx.JSON(iris.StatusOK,&enity.Result{"01110001", err, daily_bill_msg["01110001"]})
		return
	}
	accountMap,err := userCashAccountService.BasicMapByUserId(userId)
	if err != nil {
		common.Logger.Debugln("CountAllocatableMoney BasicMapByUserId error",err)
		ctx.JSON(iris.StatusOK,&enity.Result{"01110001", err, daily_bill_msg["01110001"]})
		return
	}
	cast := viper.GetInt("bill.cast")
	if !(accountMap[userId].Type == 1 && amount <= viper.GetInt("bill.borderValue")) {
		// 如果不是支付宝且金额少于200的情况
		cast = amount*viper.GetInt("bill.rate")/100
	}

	ctx.JSON(iris.StatusOK,&enity.Result{"01110000", map[string]interface{}{
		"totalAmount": amount,
		"count": count,
		"cast":cast,

	}, daily_bill_msg["01110000"]})
}
