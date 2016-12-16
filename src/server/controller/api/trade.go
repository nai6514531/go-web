package controller

import (
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/common"
	"github.com/spf13/viper"
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
		"01080203": "无当前用户登陆信息",
		"01080204": "无操作权限",
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
	/*rel, err := userRoleRelService.BasicByUserId(userId)
	if err != nil {

	}
	if rel.RoleId == 2 { //代理商
		ids, err = userService.SubChildIdsByUserId(userId)
		if err != nil {

		}
		ids = append(ids, userId)
		if len(ids) <= 0 {

		}
	}*/
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

	userId ,_:= ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	role, err := userRoleRelService.BasicByUserId(userId)
	if err != nil {
		result = &enity.Result{"01080203", err.Error(), trade_msg["01080203"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if role.RoleId == 2 {
		result = &enity.Result{"01080204", nil, trade_msg["01080204"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	washId, err := ctx.URLParamInt("washId")
	if err != nil {
		result = &enity.Result{"01080202", err.Error(), trade_msg["01080202"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	account := ctx.URLParam("account")
	if washId < 0 || account == "" {
		result = &enity.Result{"01080202", nil, trade_msg["01080202"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	_, err = tradeService.Refund(washId, account)
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
