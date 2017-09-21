package controller

import (
	"github.com/bitly/go-simplejson"
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/service"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/enity"
	"github.com/go-errors/errors"
	"github.com/jinzhu/gorm"
	"maizuo.com/soda-manager/src/server/kit/functions"
)

type BillController struct {
}
var (
	bill_msg = map[string]string{
		"01100000":"生成账单成功",
		"01100001":"生成账单失败",
		"01100003":"账单不存在",
		"01100004":"用户没有权限",
		"01100005":"更新账单状态失败",
		"01100006":"账单状态异常，请联系管理员进行修改",
		"01100007":"获取微信账单批次号信息失败",
		"01100008":"获取账单信息失败",

		"01100100":"拉取账单列表成功",
		"01100101":"拉取账单列表失败",

		"01100200":"拉取账单详情成功",
		"01100201":"拉取账单详情失败",
		"01100202":"无此账单",

		"01100300":"拉取账单手续费详情成功",
		"01100301":"拉取账单详情失败",
		"01100302":"无此账单",
		"01100303":"拉取用户账号信息失败",
	}
)
// 根据id是否为空来新增或者修改bill
func (self *BillController) InsertOrUpdate(ctx *iris.Context) {
	billService := &service.BillService{}
	userCashAccountService := &service.UserCashAccountService{}
	billRelService := &service.BillRelService{}
	reqeust := simplejson.New()
	ctx.ReadJSON(reqeust)
	billId := reqeust.Get("id").MustString()
	userId,_ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	//userId = 1
	userCashAccount,err := userCashAccountService.BasicByUserId(userId)
	if err != nil {
		// 用户账号信息有误
		common.Logger.Debugln("InsertOrUpdate userCashAccount err-----------",err)
		result := &enity.Result{"01100006",err,bill_msg["01100006"]}
		common.Log(ctx,result)
		ctx.JSON(iris.StatusOK,result )
		return
	}
	if billId == "" {
		// 提现操作
		billId,err = billService.Withdraw(userId,userCashAccount)
		if err != nil {
			common.Logger.Debugln("InsertOrUpdate Insert err:",err)
			result := &enity.Result{"01100001",err,bill_msg["01100001"]}
			common.Log(ctx,result)
			ctx.JSON(iris.StatusOK,result )
			return
		}

	}else{
		// 重新发起结算
		bill,err := billService.BasicByBillId(billId)
		if err != nil && err != gorm.ErrRecordNotFound {
			result := &enity.Result{"01100008",err,bill_msg["01100008"]}
			common.Log(ctx,result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if err == gorm.ErrRecordNotFound {
			common.Logger.Debugln("账单不存在")
			result := &enity.Result{"01100003",err,bill_msg["01100003"]}
			common.Log(ctx,result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		if bill.AccountType == 2 { // 如果是微信
			// 判断是不是因为SystemError引起的,是的话不能结算
			billRels,err := billRelService.Baisc(billId)
			if err != nil || len(*billRels) == 0{
				// 获取微信账单批次号信息失败
				result := &enity.Result{"01100007",err,bill_msg["01100007"]}
				common.Log(ctx,result)
				ctx.JSON(iris.StatusOK, result)
				return
			}
			if (*billRels)[0].ErrCode == "SYSTEMERROR" {
				// 不允许用户发起提现
				result := &enity.Result{"01100006",err,bill_msg["01100006"]}
				common.Log(ctx,result)
				ctx.JSON(iris.StatusOK, result)
				return
			}
		}

		if bill.UserId != userId {
			result := &enity.Result{"01100004",errors.New("用户没有权限"),bill_msg["01100004"]}
			common.Log(ctx,result)
			ctx.JSON(iris.StatusOK,result)
			return
		}

		err = billService.ReWithDraw(billId,userId,userCashAccount)
		if err != nil {
			result :=&enity.Result{"01100005",err,bill_msg["01100005"]}
			common.Log(ctx,result)
			ctx.JSON(iris.StatusOK,result )
			return
		}

	}
	result := &enity.Result{"01100000",map[string]interface{}{"id":billId},bill_msg["01100000"]}
	common.Log(ctx,result)
	ctx.JSON(iris.StatusOK,result)
	return

}
// 获取账单列表
func (self *BillController) List(ctx *iris.Context) { // TODO 返回值要多加period字段
	billService := &service.BillService{}
	page,_ := ctx.URLParamInt("page")
	perPage,_ := ctx.URLParamInt("perPage")
	status,_ := ctx.URLParamInt("status")
	startAt := ctx.URLParam("startAt")
	endAt := ctx.URLParam("endAt")
	userId,_ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	total,err := billService.Total(page,perPage,status,startAt,endAt,userId)
	if err != nil {
		common.Logger.Debugln("List billService.Total error---------",err)
		result := &enity.Result{"01100101",err,bill_msg["01100101"]}
		ctx.JSON(iris.StatusOK,result)
		common.Log(ctx,result)
		return
	}
	if page == -1 {
		page = 1
	}
	if perPage == -1 {
		perPage = 10
	}

	list, err := billService.List(page,perPage,status,startAt,endAt,userId)
	if err != nil {
		common.Logger.Debugln("List billService.List error---------",err)
		result := &enity.Result{"01100101",err,bill_msg["01100101"]}
		common.Log(ctx,result)
		ctx.JSON(iris.StatusOK,result)
		return
	}
	result := &enity.Result{"01100100",&enity.Pagination{total,list},bill_msg["01100100"]}
	ctx.JSON(iris.StatusOK,result)
	common.Log(ctx,result)
	return
}

func (self *BillController) DetailsByBillId(ctx *iris.Context) {
	billService := &service.BillService{}
	billId := ctx.Param("billId")
	bill,err := billService.BasicByBillId(billId)
	if err != nil && err != gorm.ErrRecordNotFound{
		result := &enity.Result{Status:"01100201",Data:err,Msg:bill_msg["01100201"]}
		common.Log(ctx,result)
		ctx.JSON(iris.StatusOK,result)
		return
	}
	if err == gorm.ErrRecordNotFound{
		result := &enity.Result{Status:"01100202",Data:err,Msg:bill_msg["01100202"]}
		common.Log(ctx,result)
		ctx.JSON(iris.StatusOK,result)
		return
	}

	result := &enity.Result{Status:"01100200",Data: map[string]interface{}{
		"totalAmount":bill.TotalAmount,
		"count":bill.Count,
	},Msg:bill_msg["01100100"]}

	ctx.JSON(iris.StatusOK,result)
	common.Log(ctx,result)
	return
}

/* 用于重新提现时计算账单的手续费 */
func (self *BillController) CastByBillId(ctx *iris.Context) {
	billService := &service.BillService{}
	userCashAccountService := service.UserCashAccountService{}
	billId := ctx.Param("billId")
	bill,err := billService.BasicByBillId(billId)
	if err != nil && err != gorm.ErrRecordNotFound{
		result := &enity.Result{Status:"01100201",Data:err,Msg:bill_msg["01100201"]}
		common.Log(ctx,result)
		ctx.JSON(iris.StatusOK,result)
		return
	}
	if err == gorm.ErrRecordNotFound{
		result := &enity.Result{Status:"01100202",Data:err,Msg:bill_msg["01100202"]}
		common.Log(ctx,result)
		ctx.JSON(iris.StatusOK,result)
		return
	}
	userId,_ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	cashAccount,err := userCashAccountService.BasicByUserId(userId)
	if err != nil {
		result := &enity.Result{Status:"01100203",Data:err,Msg:bill_msg["01100203"]}
		common.Log(ctx,result)
		ctx.JSON(iris.StatusOK,result)
		return
	}
	cast := bill.Cast
	if bill.AccountType != cashAccount.Type { // 更换了收款账号类型,重新计算手续费的东西
		rate :=  viper.GetInt("bill.aliPay.rate")
		alipay,wechat := 1,2
		if cashAccount.Type == alipay { // 支付宝
			if bill.TotalAmount > viper.GetInt("bill.aliPay.borderValue") {
				rate = 1
				cast = int(functions.Round(float64(bill.TotalAmount * rate)/100.00,0))//四舍五入
			} else {
				cast = viper.GetInt("bill.aliPay.cast")
			}
		}else if cashAccount.Type == wechat {
			rate = viper.GetInt("bill.wechat.rate")
			cast = int(functions.Round(float64(bill.TotalAmount * rate)/100.00,0))//四舍五入
		}

	}
	result := &enity.Result{Status:"01100200",Data: map[string]interface{}{
		"cast":cast,
	},Msg:bill_msg["01100100"]}
	ctx.JSON(iris.StatusOK,result)
	common.Log(ctx,result)
	return
}
