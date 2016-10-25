package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"strings"
	"maizuo.com/soda-manager/src/server/common"
	"strconv"
	"github.com/spf13/viper"
	"encoding/json"
)

type DailyBillController struct {
}

var (
	daily_bill_msg = map[string]string{
		"01060001": "拉取参数异常",

		"01060100": "拉取日账单列表成功",
		"01060101": "拉取日账单列表失败",
		"01060102": "拉取日账单总数失败",

		"01060200": "拉取日账单明细列表成功",
		"01060201": "拉取日账单明细列表失败",
		"01060202": "拉取日账单明细总数失败",

		"01060300": "更新日账单状态成功",
		"01060301": "更新日账单状态失败",
		"01060302": "更新日账单状态部分失败",
		"01060303": "请求修改状态参数有误",

		"01060400": "日账单结账成功",
		"01060401": "日账单结账失败",
		"01060402": "日账单部分结账失败",
		"01060403": "选中用户未申请提现或已结账",
		"01060404": "无选中用户账户信息",
		"01060405": "无登陆用户角色信息",
		"01060406": "无操作权限",

	}
)

/**
还未优化代码
 */
func (self *DailyBillController) List(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	userRoleRelService := &service.UserRoleRelService{}
	result := &enity.Result{}
	params := ctx.URLParams()
	page := functions.StringToInt(params["page"])
	perPage := functions.StringToInt(params["perPage"])
	cashAccounType := functions.StringToInt(params["cashAccountType"])      //提现方式
	var status []string
	var _status []string
	userId := -1
	if params["status"] != "" {
		_status = strings.Split(params["status"], ",")  //结算状态和提现状态
	}

	siginUserId := ctx.Session().GetInt(viper.GetString("server.session.user.id")) //对角色判断
	userRoleRel, err := userRoleRelService.BasicByUserId(siginUserId)
	if err != nil {
		return
	}
	if len(_status) <= 0 {
		switch userRoleRel.RoleId {
		case 1:
			status = _status
			break
		case 3:
			status = append(status, "1")
			status = append(status, "2")
			status = append(status, "3")
			break
		default:
			userId = siginUserId
			break
		}
	}else {
		for _, s := range _status {
			switch userRoleRel.RoleId {
			case 1:
				status = append(status, s)
				break
			case 3:
				if s == "1" || s == "2" || s == "3" {
					status = append(status, s)
				}
				break
			default:
				userId = siginUserId
				break
			}
		}
	}
	common.Logger.Warningln("!!!!!!!!!!!!!!!!!!!!!!1", status)
	if userRoleRel.RoleId == 3 && len(status) <= 0 {
		status = append(status, "1")
		status = append(status, "2")
		status = append(status, "3")
	}
	billAt := params["billAt"]

	if page <= 0 || perPage <= 0 {
		//ctx.JSON(iris.StatusOK, &enity.Result{"01060001", nil, daily_bill_msg["01060001"]})
		common.Logger.Warningln(daily_bill_msg["01060001"])
		return
	}

	total, err := dailyBillService.TotalByAccountType(cashAccounType, status, billAt, userId)
	if err != nil {
		result = &enity.Result{"01060102", nil, daily_bill_msg["01060102"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	list, err := dailyBillService.ListWithAccountType(cashAccounType, status, billAt, userId, page, perPage)
	if err != nil {
		result = &enity.Result{"01060101", nil, daily_bill_msg["01060101"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01060100", &enity.Pagination{total, list}, daily_bill_msg["01060100"]}
	ctx.JSON(iris.StatusOK, result)
}

func (self *DailyBillController) DetailList(ctx *iris.Context) {
	dailyBillDetailService := &service.DailyBillDetailService{}
	result := &enity.Result{}
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("perPage")
	userId, _ := ctx.URLParamInt("userId")
	billAt := ctx.URLParam("billAt")
	total, err := dailyBillDetailService.TotalByUserIdAndBillAt(userId, billAt)
	if err != nil {
		result = &enity.Result{"01060202", nil, daily_bill_msg["01060202"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	list, err := dailyBillDetailService.ListByUserIdAndBillAt(userId, billAt, page, perPage)
	if err != nil {
		result = &enity.Result{"01060201", nil, daily_bill_msg["01060201"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01060200", &enity.Pagination{total, list}, daily_bill_msg["01060200"]}
	ctx.JSON(iris.StatusOK, result)
}

func (self *DailyBillController) Apply(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	params := ctx.URLParams()
	userIdStr := params["userId"]
	billAt := params["billAt"]
	status, _ := strconv.Atoi(params["status"])
	if status != 1 && status != 0{
		common.Logger.Warningln(daily_bill_msg["01060303"], ": ", status)
		ctx.JSON(iris.StatusOK, daily_bill_msg["01060303"])
		return
	}
	if userIdStr == "" {
		common.Logger.Warningln(daily_bill_msg["01060001"])
		return
	}
	userIds := strings.Split(userIdStr, ",")

	rows, err := dailyBillService.UpdateStatus(status, billAt, userIds...)
	if err != nil {
		common.Logger.Warningln(daily_bill_msg["01060302"])
		ctx.JSON(iris.StatusOK, &enity.Result{"01060302", nil, daily_bill_msg["01060302"]})
		return
	}

	common.Logger.Debugln("rows, userIds============", rows, ", =======", userIds)
	if rows != int64(len(userIds)) {
		common.Logger.Warningln(daily_bill_msg["01060302"])
		ctx.JSON(iris.StatusOK, &enity.Result{"01060302", nil, daily_bill_msg["01060302"]})
		return
	}

	ctx.JSON(iris.StatusOK, &enity.Result{"01060300", nil, daily_bill_msg["01060300"]})
}

func (self *DailyBillController) Settlement(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	userCashAccountService := &service.UserCashAccountService{}
	userRoleRelService := &service.UserRoleRelService{}
	_userIds := []int{}
	aliPayUserIds := []string{}
	wechatPayUserIds := []string{}
	bankPayUserIds := []string{}
	var result *enity.Result
	isSuccessed := true
	siginUserId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))

	userRoleRel, err := userRoleRelService.BasicByUserId(siginUserId)
	if err != nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"01060405", nil, daily_bill_msg["01060405"]})
		return
	}
	if userRoleRel.RoleId != 3 && userRoleRel.RoleId != 1{    //不是财务角色
		ctx.JSON(iris.StatusOK, &enity.Result{"01060406", nil, daily_bill_msg["01060406"]})
		return
	}

	var params map[string]interface{}
	json.Unmarshal(ctx.PostBody(), &params)
	if params["params"] == nil {
		common.Logger.Warningln(daily_bill_msg["01060001"])
		return
	}
	paramList := params["params"].([]interface{})
	for _, _param := range paramList {
		_map := _param.(map[string]interface{})
		if _map["userId"] == nil || _map["billAt"] == nil {
			continue
		}
		userIdStr := _map["userId"].(string)
		billAt := _map["billAt"].(string)
		if userIdStr == "" || billAt == "" {
			//common.Logger.Warningln(daily_bill_msg["01060001"])
			continue
		}
		userIds := strings.Split(userIdStr, ",")

		//过滤掉未申请提现的用户
		dailyBillMap, err := dailyBillService.BasicMap(billAt, 1, userIds...)        //查询出已申请提现的用户
		if err != nil || len(*dailyBillMap) <=0 {
			//ctx.JSON(iris.StatusOK, &enity.Result{"01060403", nil, daily_bill_msg["01060403"]})
			continue
		}
		for _userId, _ := range *dailyBillMap {
			_userIds = append(_userIds, _userId)
		}
		if len(_userIds) <= 0 {
			//ctx.JSON(iris.StatusOK, &enity.Result{"01060403", nil, daily_bill_msg["01060403"]})
			continue
		}

		accountMap, err := userCashAccountService.BasicMapByUserId(_userIds)
		if err != nil || len(*accountMap) <= 0 {
			//ctx.JSON(iris.StatusOK, &enity.Result{"01060404", nil, daily_bill_msg["01060404"]})
			continue
		}

		for _, _account := range *accountMap {
			switch _account.Type {
			case 1: //支付宝
				break
			case 2: //微信
				break
			case 3: //银行
				bankPayUserIds = append(bankPayUserIds, strconv.Itoa(_account.UserId))
				break
			}
		}

		//update aliPay
		if len(aliPayUserIds) > 0 {

		}

		//update wechatPay
		if len(wechatPayUserIds) > 0 {

		}

		//update bankPay
		if len(bankPayUserIds) > 0 {
			rows, err := dailyBillService.UpdateStatus(2, billAt, bankPayUserIds...)
			if err != nil {
				common.Logger.Warningln("银行结算更新失败")
				isSuccessed = false
			}
			if rows != int64(len(bankPayUserIds)) {
				common.Logger.Warningln("银行结算部分更新失败")
				isSuccessed = false
			}
		}
	}

	if isSuccessed {
		result = &enity.Result{"01060400", nil, daily_bill_msg["01060400"]}
	}else {
		result = &enity.Result{"01060402", nil, daily_bill_msg["01060402"]}
	}
	ctx.JSON(iris.StatusOK, result)
}
