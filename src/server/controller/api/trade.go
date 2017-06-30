package controller

import (
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/common"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/service/soda"
	"strings"
	"maizuo.com/soda-manager/src/server/model"
	"github.com/bitly/go-simplejson"
	"maizuo.com/soda-manager/src/server/model/soda"
	"encoding/json"
	"time"
)

var (
	trade_msg = map[string]string{
		"01080100": "拉取模块数据成功",
		"01080101": "拉取模块数据失败",
		"01080102": "缺少参数",
		"01080103": "查询分页总条数失败",

		"01080200": "退款成功",
		"01080201": "退款失败",
		"01080202": "参数错误",
		"01080203": "无当前用户登录信息",
		"01080204": "无操作权限",
		"01080205": "用户信息与洗衣记录不符",
		"01080206": "洗衣记录不存在",
		"01080207": "芯片卡支付方式不支持退款",
		"01080208": "只能为当天订单退款",

		"01080300": "拉取充值记录列表成功",
		"01080301": "拉取失败",

		"01080400": "充值成功",
		"01080401": "充值失败",
		"01080402": "参数异常，请检查请求参数",
		"01080403": "学生登录手机号不存在，请检查",
		"01080404": "该学生用户已被其它商家操作充值，此次充值失败，请联系苏打生活工作人员解决。",
		"01080405": "有不存在的商家账号，请检查",

		"01080500": "修改成功",
		"01080501": "修改失败",
		"01080502": "有不存在的商家账号，请检查",
		"01080503": "参数异常，请检查请求参数",
		"01080505": "有不存在的商家账号，请检查",

		"01080600": "查询成功",
		"01080601": "查询失败",
		"01080602": "参数异常，请检查请求参数",
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
	serialNumber := ctx.URLParam("serialNumber")
	account := ctx.URLParam("account")
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("perPage")
	if serialNumber == "" && account == "" {
		result = &enity.Result{"01080102", nil, trade_msg["01080102"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	list, err := tradeService.BasicOfDevice(serialNumber, account, page, perPage)
	common.Logger.Debug("list========", list)
	if err != nil {
		result = &enity.Result{"01080101", err.Error(), trade_msg["01080101"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	total, err := tradeService.TotalOfDevice(serialNumber, account)
	if err != nil {
		result = &enity.Result{"01080103", err.Error(), trade_msg["01080103"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01080100", &enity.Pagination{total, list}, statis_msg["01080100"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *TradeController) Refund(ctx *iris.Context) {
	result := &enity.Result{}
	tradeService := &service.TradeService{}
	userRoleRelService := service.UserRoleRelService{}

	userId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	role, err := userRoleRelService.BasicByUserId(userId)
	if err != nil {
		result = &enity.Result{"01080203", err.Error(), trade_msg["01080203"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	ticketId := ctx.URLParam("washId")
	mobile := ctx.URLParam("account")
	if ticketId == "" || mobile == "" {
		result = &enity.Result{"01080202", nil, trade_msg["01080202"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	ticketService := &sodaService.TicketService{}
	ticket, err := ticketService.BasicByTicketId(ticketId)
	if err != nil {
		result = &enity.Result{"01080206", err.Error(), trade_msg["01080206"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if role.RoleId == 2 && userId != ticket.OwnerId {
		//限定了商家退款时只能操作自己名下的设备产生的订单
		result = &enity.Result{"01080204", nil, trade_msg["01080204"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if ticket.PaymentId == 4 {
		result = &enity.Result{"01080207", nil, trade_msg["01080207"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	if ticket.Mobile != strings.Trim(mobile, " ") {
		result = &enity.Result{"01080205", err.Error(), trade_msg["01080205"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if ticket.CreatedAt.YearDay()!= time.Now().YearDay() {
		result = &enity.Result{"01080208", nil, trade_msg["01080208"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	_, err = tradeService.Refund(ticketId, mobile)
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
//
func (self *TradeController) Recharge(ctx *iris.Context) {
	//这里的snapshot会储存大量相关查询得到的信息，以便在service调用的时候复用。在提交数据库时，会储存简化版本的simpleSnapshot
	snapshot := sodaService.Snapshot{}
	accountService := sodaService.AccountService{}
	userSerrvice := service.UserService{}
	chipcardService := sodaService.ChipcardService{}

	param, err := simplejson.NewJson(ctx.Request.Body())
	amount := param.Get("amount").MustInt()
	mobile := param.Get("mobile").MustString()
	applyProviders := param.Get("applyProviders").MustStringArray()
	userId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))

	if amount > 50000 || amount < 0 {
		result := &enity.Result{"01080402", nil, trade_msg["01080402"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	if err != nil || amount <= 0 || mobile == "" || len(applyProviders) == 0 {
		result := &enity.Result{"01080402", nil, trade_msg["01080402"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//验证手机号码是否存在
	account, err := accountService.FindByMobile(mobile)
	if err != nil {
		result := &enity.Result{"01080403", err.Error(), trade_msg["01080403"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	snapshot.CAccount = *account
	applyUsers := make([]model.User, len(applyProviders))
	//验证商家账号是否全部输入正确
	for i, v := range applyProviders {
		user, err := userSerrvice.FindByAccount(v)
		if err != nil {
			result := &enity.Result{"01080405", v, trade_msg["01080405"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		applyUsers[i] = *user
	}
	snapshot.ApplyUsers = applyUsers
	//验证当前用户是否能够为此C端用户充值
	card, _ := chipcardService.BasicByMobile(mobile)
	if card.OperatorId != userId && card.OperatorId > 0 {
		result := &enity.Result{"01080404", nil, trade_msg["01080404"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	snapshot.Chipcard = card
	s, _ := json.Marshal(snapshot)
	recharge := soda.ChipcardRecharge{
		Mobile:mobile,
		OperatorId:userId,
		Value:amount,
		Snapshot:string(s),
	}

	record, err := chipcardService.Recharge(recharge)
	if err != nil {
		result := &enity.Result{"01080401", nil, trade_msg["01080401"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result := &enity.Result{"01080400", record, trade_msg["01080400"]}
	ctx.JSON(iris.StatusOK, result)
}

//按手机号码查询IC卡充值记录
func (self *TradeController) ListRecharges(ctx *iris.Context) {
	total := 0
	perPage, _ := ctx.URLParamInt("perPage")
	page, _ := ctx.URLParamInt("page")
	mobile := ctx.URLParam("mobile")
	chipcardService := sodaService.ChipcardService{}
	userId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	list, err := chipcardService.ListByMobile(userId, mobile, perPage, page)
	if err != nil {
		result := &enity.Result{"01080301", err.Error(), trade_msg["010803001"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	total, err = chipcardService.TotalByMobile(userId, mobile)
	if err != nil {
		result := &enity.Result{"01080301", err.Error(), trade_msg["010803001"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result := &enity.Result{"01080300", &enity.Pagination{total, list}, trade_msg["01080300"]}
	ctx.JSON(iris.StatusOK, result)
}

func (self *TradeController) ChangeCBRels(ctx *iris.Context) {
	userSerrvice := service.UserService{}
	chipcardService := sodaService.ChipcardService{}
	param, err := simplejson.NewJson(ctx.Request.Body())
	if err != nil {
		result := &enity.Result{"01080503", err.Error(), trade_msg["01080503"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	id := param.Get("id").MustInt()
	applyProviders := param.Get("applyProviders").MustStringArray()
	applyUsers := make([]model.User, len(applyProviders))
	for i, v := range applyProviders {
		user, err := userSerrvice.FindByAccount(v)
		if err != nil {
			result := &enity.Result{"01080505", v, trade_msg["01080505"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		applyUsers[i] = *user
	}
	chipcard, err := chipcardService.ChangeRel(id, applyUsers)
	if chipcard.Id <= 0 {
		result := &enity.Result{"01080503", err.Error(), trade_msg["01080503"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if err != nil {
		result := &enity.Result{"01080405", nil, trade_msg["01080405"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result := &enity.Result{"01080500", chipcard, trade_msg["01080500"]}
	common.Log(ctx, result)
	ctx.JSON(iris.StatusOK, result)
	return
}

func (self *TradeController) ChipcardBasic(ctx *iris.Context) {
	type CardInfo struct {
		soda.Chipcard
		TotalCharged	int	`json:"totalCharged"`
		TotalConsumed	int	`json:"totalConsumed"`
	}
	mobile := ctx.URLParam("mobile")
	chipcardService := sodaService.ChipcardService{}
	if mobile == "" {
		result := &enity.Result{"01080602", nil, trade_msg["01080602"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	card, err := chipcardService.BasicByMobile(mobile)
	cardInfo := CardInfo{
		card,0,0,
	}
	rechargeList, err := chipcardService.ListByMobile(0, mobile, 0, 0)
	temp := 0
	for _, rec := range *rechargeList {
		temp += rec.Value
	}
	cardInfo.TotalCharged = temp
	cardInfo.TotalConsumed = temp - card.Value
	if err != nil {
		result := &enity.Result{"01080601", err.Error(), trade_msg["01080601"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	result := &enity.Result{"01080600", cardInfo, trade_msg["01080600"]}
	common.Log(ctx, result)
	ctx.JSON(iris.StatusOK, result)
	return
}
