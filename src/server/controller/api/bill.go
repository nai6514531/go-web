package controller

import (
	"github.com/bitly/go-simplejson"
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/service"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/enity"
	//"time"
	"time"
)

type BillController struct {
}
var (
	bill_msg = map[string]string{
		"01100000":"生成账单成功",
		"01100001":"生成账单失败",
		"01100002":"更新账单失败",

		"01100100":"拉取账单列表成功",
		"01100101":"拉取账单列表失败",
	}
)
// 根据id是否为空来新增或者修改bill
func (self *BillController) InsertOrUpdate(ctx *iris.Context) {
	billService := &service.BillService{}
	userCashAccountService := &service.UserCashAccountService{}
	reqeust := simplejson.New()
	ctx.ReadJSON(reqeust)
	id, _ := reqeust.Get("id").Int()
	userId,_ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	//userId = 1
	userCashAccount,err := userCashAccountService.BasicByUserId(userId)
	if err != nil {
		// 用户账号信息有误
		common.Logger.Debugln("InsertOrUpdate userCashAccount err-----------",err)
		ctx.JSON(iris.StatusOK,&enity.Result{"01100001",nil,bill_msg["01100001"]} )
		return
	}
	if id == 0 {
		id,err = billService.Insert(userId,userCashAccount)
		if err != nil {
			common.Logger.Debugln("InsertOrUpdate Insert err:",err)
			ctx.JSON(iris.StatusOK,&enity.Result{"01100001",nil,bill_msg["01100001"]} )
			return
		}

	}else{
		bill,err := billService.GetById(id)
		if err != nil {
			common.Logger.Debugln("账单不存在")
			ctx.JSON(iris.StatusOK,&enity.Result{"01100002",nil,bill_msg["01100002"]} )
			return
		}
		if bill.UserId != userId {
			common.Logger.Debugln("用户没有权限")
			ctx.JSON(iris.StatusOK,&enity.Result{"01100002",nil,bill_msg["01100002"]} )
			return
		}
		_,err = billService.Update(id,userId,userCashAccount)
		if err != nil {
			common.Logger.Debugln("InsertOrUpdate Update err-----------",err)
			ctx.JSON(iris.StatusOK,&enity.Result{"01100002",nil,bill_msg["01100002"]} )
			return
		}

	}
	ctx.JSON(iris.StatusOK,&enity.Result{"01100000",map[string]interface{}{"id":id},bill_msg["01100000"]})
	return

}
// 获取账单列表
func (self *BillController) List(ctx *iris.Context) {
	billService := &service.BillService{}
	page,perPage,status,startAt,endAt := 1,10,-1,"2006-01-02",time.Now().Local().Format("2006-01-02")
	page,_ = ctx.URLParamInt("page")
	perPage,_ = ctx.URLParamInt("perPage")
	status,_ = ctx.URLParamInt("status")
	startAt = ctx.URLParam("startAt")
	endAt = ctx.URLParam("endAt")
	userId,_ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	total,err := billService.Total(page,perPage,status,startAt,endAt,userId)
	if err != nil {
		common.Logger.Debugln("List billService.Total error---------",err)
		ctx.JSON(iris.StatusOK,&enity.Result{"01100101",nil,bill_msg["01100101"]} )
		return
	}
	list, err := billService.List(page,perPage,status,startAt,endAt,userId)
	if err != nil {
		common.Logger.Debugln("List billService.List error---------",err)
		ctx.JSON(iris.StatusOK,&enity.Result{"01100101",nil,bill_msg["01100101"]} )
		return
	}
	ctx.JSON(iris.StatusOK,&enity.Result{"01100100",&enity.Pagination{total,list},bill_msg["01100100"]} )
	return
}
