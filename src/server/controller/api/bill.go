package controller

import (
	"github.com/bitly/go-simplejson"
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/service"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/enity"
	"github.com/go-errors/errors"
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
		"01100006":"获取用户账号信息失败",
		"01100007":"删除账单批次号失败",


		"01100100":"拉取账单列表成功",
		"01100101":"拉取账单列表失败",
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
		if bill.AccountType == 2 { // 如果是微信
			// 判断是不是因为SystemError引起的,是的话不能结算
			billRels,err := billRelService.Baisc(billId)
			if err != nil {
				// 获取微信账单批次号信息失败
				result := &enity.Result{"01100003",err,bill_msg["01100003"]}
				common.Log(ctx,result)
				ctx.JSON(iris.StatusOK, result)
				return
			}
			if (*billRels)[0].ErrCode == "SYSTEMERROR" {
				// 不允许用户发起提现
				result := &enity.Result{"01100003",err,bill_msg["01100003"]}
				common.Log(ctx,result)
				ctx.JSON(iris.StatusOK, result)
				return
			}
		}
		if err != nil {
			common.Logger.Debugln("账单不存在")
			result := &enity.Result{"01100003",err,bill_msg["01100003"]}
			common.Log(ctx,result)
			ctx.JSON(iris.StatusOK, result)
			return
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
func (self *BillController) List(ctx *iris.Context) {
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
