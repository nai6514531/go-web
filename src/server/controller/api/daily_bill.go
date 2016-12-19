package controller

import (
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"strings"
	"maizuo.com/soda-manager/src/server/common"
	"strconv"
	"github.com/spf13/viper"
	"encoding/json"
	"time"
	"maizuo.com/soda-manager/src/server/kit/alipay"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/export"
)

type DailyBillController struct {
}

var (
	daily_bill_msg = map[string]string{
		"01060100": "拉取日账单列表成功",
		"01060101": "拉取日账单列表失败",
		"01060102": "拉取日账单总数失败",
		"01060103": "无当前登陆用户角色信息",
		"01060104": "页数或每页展示条数不大于0",

		"01060200": "拉取日账单明细列表成功",
		"01060201": "拉取日账单明细列表失败",
		"01060202": "拉取日账单明细总数失败",
		"01060203": "无该用户设备信息",

		"01060300": "更新日账单状态成功",
		"01060301": "更新日账单状态失败",
		"01060302": "更新日账单状态部分失败",
		"01060303": "请求修改状态参数有误",
		"01060304": "申请结账用户不能大于一位",
		"01060305": "无该用户账户信息",
		"01060306": "该用户账单不是通过银行结账,故不可申请结账",
		"01060307": "参数用户id不能为空",

		"01060400": "日账单结账成功",
		"01060401": "银行结算更新状态失败",
		"01060402": "支付宝结算更新状态失败",
		"01060403": "所选中的银行结算用户未申请提现或已结账",
		"01060404": "无选中用户账户信息",
		"01060405": "无登陆用户角色信息",
		"01060406": "无操作权限",
		"01060407": "所选中的支付宝结算用户无结算失败日账单",
		"01060408": "解析json异常",
		"01060409": "传参json异常",
		"01060410": "所选支付宝账单超出批次结算最大值1000",
		"01060411": "所选账单中包含已结账账单，请重新选择",

		"01060500": "更新支付宝账单成功",
		"01060501": "更新支付宝账单结账状态失败",
		"01060502": "软删除支付宝失败订单批次号失败",
		"01060503": "插入支付宝账单信息失败",
		"01060504": "查询无支付宝返回成功订单详情数据",
		"01060505": "查询无支付宝返回失败订单详情数据",

		"01060600": "取消支付宝批量支付成功",
		"01060601": "取消支付宝批量支付失败,请联系技术人员解锁提交账单",
		"01060602": "无取消订单号",
		"01060603": "参数异常",

		"01060700":"标记账单成功",
		"01060701":"标记账单失败",
		"01060703":"请选择需要标记的账单",

		"01060800":"导出结算列表成功",
		"01060801":"导出结算列表失败",
		"01060802":"无当前登陆用户角色信息",
		"01060803":"拉取日账单列表失败",
	}
)



func (self *DailyBillController) List(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	//userRoleRelService := &service.UserRoleRelService{}
	result := &enity.Result{}
	params := ctx.URLParams()
	page := functions.StringToInt(params["page"])
	perPage := functions.StringToInt(params["perPage"])
	cashAccountType := functions.StringToInt(params["cashAccountType"])      //提现方式
	searchStr := params["searchStr"]
	startAt := params["startAt"]
	endAt := params["endAt"]
	var status []string
	userId := -1
	signinUserId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id")) //对角色判断
	status, userId, roleId, err := dailyBillService.Permission(params["status"], signinUserId)
	if err != nil {
		result = &enity.Result{"01060103", err.Error(), daily_bill_msg["01060103"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if page <= 0 || perPage <= 0 {
		ctx.JSON(iris.StatusOK, &enity.Result{"01060104", nil, daily_bill_msg["01060104"]})
		return
	}
	total, err := dailyBillService.TotalByAccountType(cashAccountType, status, userId, searchStr, roleId, startAt, endAt)
	if err != nil {
		result = &enity.Result{"01060102", err.Error(), daily_bill_msg["01060102"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	list, err := dailyBillService.ListWithAccountType(cashAccountType, status, userId, searchStr, page, perPage, roleId, startAt, endAt)
	if err != nil {
		result = &enity.Result{"01060101", err.Error(), daily_bill_msg["01060101"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01060100", &enity.Pagination{total, list}, daily_bill_msg["01060100"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *DailyBillController) Apply(ctx *iris.Context) {
	result := &enity.Result{}
	dailyBillService := &service.DailyBillService{}
	params := ctx.URLParams()
	userIdStr := params["userId"]
	billAt := params["billAt"]
	status, _ := strconv.Atoi(params["status"])
	if status != 1 && status != 0 {
		common.Logger.Debugln(daily_bill_msg["01060303"], ": ", status)
		ctx.JSON(iris.StatusOK, daily_bill_msg["01060303"])
		return
	}
	if userIdStr == "" {
		ctx.JSON(iris.StatusOK, daily_bill_msg["01060303"])
		return
	}
	userIds := strings.Split(userIdStr, ",")
	if len(userIds) != 1 {
		ctx.JSON(iris.StatusOK, &enity.Result{"01060304", nil, daily_bill_msg["01060304"]})
		return
	}
	//判断该用户的是否银行结算,其他方式不需或不给申请提现
	//account, err := userCashAccountService.BasicByUserId(functions.StringToInt(userIds[0]))
	accountMap, err := dailyBillService.BasicMapByBillAtAndUserId(billAt, userIds[0])
	if err != nil {
		common.Logger.Debugln(daily_bill_msg["01060305"], ":", err.Error())
		result := &enity.Result{"01060305", err.Error(), daily_bill_msg["01060305"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	account := accountMap[functions.StringToInt(userIds[0])]
	if account.AccountType != 3 {
		result = &enity.Result{"01060306", nil, daily_bill_msg["01060306"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	rows, err := dailyBillService.BatchUpdateStatus(status, billAt, userIds...)
	if err != nil {
		result = &enity.Result{"01060302", err.Error(), daily_bill_msg["01060302"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	common.Logger.Debugln("rows, userIds============", rows, ", =======", userIds)
	if rows != len(userIds) {
		common.Logger.Debugln(daily_bill_msg["01060302"])
		result = &enity.Result{"01060302", nil, daily_bill_msg["01060302"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01060300", nil, daily_bill_msg["01060300"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

/**
	申请结账
 */
func (self *DailyBillController) DetailList(ctx *iris.Context) {
	dailyBillDetailService := &service.DailyBillDetailService{}
	deviceService := &service.DeviceService{}
	result := &enity.Result{}
	page, _ := ctx.URLParamInt("page")
	perPage, _ := ctx.URLParamInt("perPage")
	userId, _ := ctx.URLParamInt("userId")
	billAt := ctx.URLParam("billAt")
	serialNum := ctx.URLParam("serialNumber")

	deviceMap, err := deviceService.BasicMapByUserId(userId)
	if err != nil {
		result = &enity.Result{"01060203", err.Error(), daily_bill_msg["01060203"]}
		common.Log(ctx, result)
	}
	total, err := dailyBillDetailService.TotalByUserIdAndBillAt(userId, billAt, serialNum)
	if err != nil {
		result = &enity.Result{"01060202", err.Error(), daily_bill_msg["01060202"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	list, err := dailyBillDetailService.ListByUserIdAndBillAt(userId, billAt, page, perPage, serialNum)
	if err != nil {
		result = &enity.Result{"01060201", err.Error(), daily_bill_msg["01060201"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	for _, _detail := range *list {
		if deviceMap[_detail.SerialNumber] != nil {
			_detail.Address = deviceMap[_detail.SerialNumber].Address
		}

	}
	result = &enity.Result{"01060200", &enity.Pagination{total, list}, daily_bill_msg["01060200"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

/*
	支付宝批量支付接口
*/
func BatchAliPay(batchNum int, batchFee int, aliPayDetailDataStr string) map[string]string {
	param := make(map[string]string, 0)
	if batchNum <= 0 || batchNum > 1000 || aliPayDetailDataStr == "" {
		return param
	}
	if strings.HasSuffix(aliPayDetailDataStr, "|") {
		aliPayDetailDataStr = aliPayDetailDataStr[:len(aliPayDetailDataStr) - 1]
	}
	common.Logger.Debugln("aliPayDetailDataStr====================", aliPayDetailDataStr)
	param["service"] = "batch_trans_notify"
	param["partner"] = viper.GetString("pay.aliPay.id")//os.Getenv("ALIPAYID")
	param["_input_charset"] = "utf-8"
	param["notify_url"] = viper.GetString("pay.aliPay.notifyUrl")
	param["account_name"] = viper.GetString("pay.aliPay.accountName")
	param["detail_data"] = aliPayDetailDataStr
	param["batch_no"] = time.Now().Local().Format("20060102150405")
	param["batch_num"] = strconv.Itoa(batchNum)
	param["batch_fee"] = functions.Float64ToString(float64(batchFee) / 100.00, 2)
	param["email"] = viper.GetString("pay.aliPay.email")
	param["pay_date"] = time.Now().Local().Format("20060102")
	param["sign"] = alipay.CreateSign(param)
	param["sign_type"] = viper.GetString("pay.aliPay.signType")
	param["request_url"] = viper.GetString("pay.aliPay.requestUrl")
	common.Logger.Debugln("batchNum======================", batchNum)
	common.Logger.Debugln("param======================", param)
	return param
}

func (self *DailyBillController) BatchPay(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	userRoleRelService := &service.UserRoleRelService{}
	billBatchNoService := &service.BillBatchNoService{}
	aliPayBillIds := make([]int, 0)
	billBatchNoList := make([]*model.BillBatchNo, 0)
	batchNum := 0
	batchFee := 0
	var result *enity.Result
	var aliPayReqParam map[string]string
	aliPayDetailDataStr := ""
	siginUserId,_ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))

	userRoleRel, err := userRoleRelService.BasicByUserId(siginUserId)
	if err != nil {
		result = &enity.Result{"01060405", err.Error(), daily_bill_msg["01060405"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if userRoleRel.RoleId != 3 {
		//不是财务角色
		result = &enity.Result{"01060406", nil, daily_bill_msg["01060406"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	var params map[string]interface{}
	if json.Unmarshal(ctx.PostBody(), &params) != nil {
		common.Logger.Debugln("解析json异常")
		result = &enity.Result{"01060408", nil, daily_bill_msg["01060408"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if params["params"] == nil {
		result = &enity.Result{"01060409", nil, daily_bill_msg["01060409"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	paramList := params["params"].([]interface{})
	for _, _param := range paramList {
		aliPayUserIds := []string{}
		bankPayUserIds := []string{}
		AliPayBillMap := make(map[int]*model.DailyBill, 0)
		bankPayBillMap := make(map[int]*model.DailyBill, 0)

		_map := _param.(map[string]interface{})
		if _map["userId"] == nil || _map["billAt"] == nil {
			continue
		}
		userIdStr := _map["userId"].(string)
		billAt := _map["billAt"].(string)
		if userIdStr == "" || billAt == "" {
			common.Logger.Warningln("缺少参数:billAt=", billAt, "==>userIdStr=", userIdStr)
			continue
		}
		userIds := strings.Split(userIdStr, ",")
		//accountMap, err := userCashAccountService.BasicMapByUserId(userIds)     //按天查出管理员所选当天的所有用户结算账号信息
		accountMap, err := dailyBillService.BasicMapByBillAtAndUserId(billAt, userIds)
		if err != nil || len(accountMap) <= 0 {
			common.Logger.Debugln(billAt, "==>", daily_bill_msg["01060404"])
			if err != nil {
				result = &enity.Result{"01060404", err.Error(), daily_bill_msg["01060404"]}
			} else {
				result = &enity.Result{"01060404", nil, daily_bill_msg["01060404"]}
			}
			common.Log(ctx, result)
			continue        //查询不到用户的账户信息就没有必要往下执行
		}
		//过滤掉未申请提现的用户
		billMap, err := dailyBillService.BasicMap(billAt, 1, userIds...)
		if err == nil  && len(billMap) > 0 {
			for _userId, _dailyBill := range billMap {
				switch accountMap[_userId].AccountType {
				case 1:                                                 //查询支付宝"已申请"的账单(后台自动将未结算改成已申请)
					AliPayBillMap[_userId] = _dailyBill
					aliPayUserIds = append(aliPayUserIds, strconv.Itoa(_userId))
				case 3:                                                 //查询出银行结算方式中已申请提现的用户(只有银行有已提现状态)
					bankPayBillMap[_userId] = _dailyBill
					bankPayUserIds = append(bankPayUserIds, strconv.Itoa(_userId))
				}
			}
			common.Logger.Warningln(billAt, "==>bankPayUserIds:", bankPayUserIds)
		}
		aliPayFailureBillMap, err := dailyBillService.BasicMap(billAt, 4, userIds...)   //查询出支付宝结算方式中失败的账单
		if err == nil && len(aliPayFailureBillMap) > 0 {
			for _userId, _dailyBill := range aliPayFailureBillMap {
				if accountMap[_userId].AccountType == 1 {
					//判断账号是否为支付宝
					AliPayBillMap[_userId] = _dailyBill
					aliPayUserIds = append(aliPayUserIds, strconv.Itoa(_userId))
				}
			}
			common.Logger.Warningln(billAt, "==>aliPayUserIds:", aliPayUserIds)
		}
		//aliPay bill
		if len(aliPayUserIds) > 0 {
			for _, _userId := range aliPayUserIds {
				_billAccount := accountMap[functions.StringToInt(_userId)]
				_dailyBill := AliPayBillMap[functions.StringToInt(_userId)]
				//判断结算方式是否为支付宝且存在该用户账单
				if _billAccount != nil && _billAccount.AccountType == 1 && _dailyBill != nil && _dailyBill.TotalAmount > 0 {
					_remark := "无"
					_remarkTime, err := time.Parse(time.RFC3339, _dailyBill.BillAt)
					if err == nil {
						_remark = _remarkTime.Format("01月02日") + "洗衣结算款"
					} else {
						common.Logger.Warningln("获取支付宝付款备注账单时间格式转换错误:", err.Error())
					}
					aliPayDetailDataStr += strconv.Itoa(_dailyBill.Id) + "^" + _billAccount.Account + "^" + _billAccount.RealName +
						"^" + functions.Float64ToString(float64(_dailyBill.TotalAmount) / 100.00, 2) + "^" + _remark + "|"          //组装支付宝支付data_detail
					aliPayBillIds = append(aliPayBillIds, _dailyBill.Id)//组装需要修改为"结账中"状态的支付宝订单
					batchFee += _dailyBill.TotalAmount
					batchNum++      //计算批量结算请求中支付宝结算的日订单数,不可超过1000
				}
			}
		}
		//update bankPay
		if len(bankPayUserIds) > 0 {
			rows, err := dailyBillService.BatchUpdateStatus(2, billAt, bankPayUserIds...)        //新旧系统的订单id不一致,所以分开更新
			if err != nil {
				common.Logger.Debugln(billAt, "==>", daily_bill_msg["01060401"], ":", err.Error())
				result = &enity.Result{"01060401", err.Error(), daily_bill_msg["01060401"]}
				common.Log(ctx, result)
				ctx.JSON(iris.StatusOK, result)
				return
			}
			if rows != len(bankPayUserIds) {
				common.Logger.Debugln(billAt, "==>银行结算部分更新失败:bankPayUserIds", bankPayUserIds)
				result = &enity.Result{"01060401", nil, daily_bill_msg["01060401"]}
				common.Log(ctx, result)
				ctx.JSON(iris.StatusOK, result)
				return
			}
		}
	}
	//查询支付宝订单中是否已有批次号的订单(再次确认,这里的支付宝订单号只是"已申请"和"结账失败"的)
	batchNoList, _ := billBatchNoService.Baisc(aliPayBillIds)
	if len(*batchNoList) > 0 {
		common.Logger.Debugln(daily_bill_msg["01060411"], ",", aliPayBillIds)
		result = &enity.Result{"01060411", nil, daily_bill_msg["01060411"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//生成支付宝请求参数并存储账单对应的批次号
	if batchNum > 0 && batchNum <= 1000 && aliPayDetailDataStr != "" {
		aliPayReqParam = BatchAliPay(batchNum, batchFee, aliPayDetailDataStr)
		if aliPayReqParam["batch_no"] == "" {
			common.Logger.Debugln("生成批次号失败")
			result = &enity.Result{"01060402", nil, daily_bill_msg["01060402"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		//create bill_batch_no
		for _, _billId := range aliPayBillIds {
			_billBatchNo := &model.BillBatchNo{BillId:_billId, BatchNo:aliPayReqParam["batch_no"]}
			billBatchNoList = append(billBatchNoList, _billBatchNo)
		}
		if len(billBatchNoList) <= 0 {
			common.Logger.Debugln("生成批次号信息失败")
			result = &enity.Result{"01060402", nil, daily_bill_msg["01060402"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		_, err := billBatchNoService.BatchCreate(&billBatchNoList)
		if err != nil {
			common.Logger.Debugln("持久化批次号失败:", err.Error())
			result = &enity.Result{"01060402", err.Error(), daily_bill_msg["01060402"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
	} else if (batchNum <= 0 || batchNum > 1000) && aliPayDetailDataStr != "" {
		common.Logger.Debugln(daily_bill_msg["01060410"], ":", batchNum)
		result = &enity.Result{"01060410", nil, daily_bill_msg["01060410"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//更新支付宝账单为"结账中"
	rows, err := dailyBillService.BatchUpdateStatusById(3, aliPayBillIds)
	if err != nil {
		common.Logger.Debugln("更新支付宝账单为'结算中'失败:", err.Error())
		result = &enity.Result{"01060402", err.Error(), daily_bill_msg["01060402"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if len(aliPayBillIds) != rows {
		common.Logger.Debugln("更新支付宝账单为'结算中'部分失败")
		result = &enity.Result{"01060402", nil, daily_bill_msg["01060402"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01060400", aliPayReqParam, daily_bill_msg["01060400"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *DailyBillController) Notification(ctx *iris.Context) {
	var err error
	dailyBillService := &service.DailyBillService{}
	billBatchNoService := &service.BillBatchNoService{}
	billRelService := &service.BillRelService{}
	common.Logger.Warningln("======================支付宝回调开始======================")
	reqMap := make(map[string]string, 0)
	billList := make([]*model.DailyBill, 0)
	failureList := make([]*model.DailyBill, 0)
	billRelList := make([]*model.BillRel, 0)
	successedBillIds := make([]int, 0)
	failureBillIds := make([]int, 0)
	successedNotifyDetail := make([]string, 0)
	failNotifyDetail := make([]string, 0)
	mnznBillList := make([]map[string]interface{}, 0)
	billIdSettledAtMap := make(map[string]string)
	successedNum := 0
	failureNum := 0
	reqMap["notify_time"] = ctx.FormValueString("notify_time")
	reqMap["notify_type"] = ctx.FormValueString("notify_type")
	reqMap["notify_id"] = ctx.FormValueString("notify_id")
	reqMap["batch_no"] = ctx.FormValueString("batch_no")
	reqMap["pay_user_id"] = ctx.FormValueString("pay_user_id")
	reqMap["pay_user_name"] = ctx.FormValueString("pay_user_name")
	reqMap["pay_account_no"] = ctx.FormValueString("pay_account_no")
	reqMap["success_details"] = ctx.FormValueString("success_details")
	reqMap["fail_details"] = ctx.FormValueString("fail_details")
	common.Logger.Debugln("signType=============", ctx.FormValueString("sign_type"))
	common.Logger.Debugln("reqMap===========================", reqMap)
	if !alipay.VerifySign(reqMap, ctx.FormValueString("sign")) {
		common.Logger.Warningln("回调数据校验失败")
		ctx.Response.SetBodyString("fail")
		return
	}
	common.Logger.Debugln("success")

	//successed status of alipaybill
	if reqMap["success_details"] != "" {
		successedNotifyDetail = strings.Split(reqMap["success_details"], "|")
		if len(successedNotifyDetail) > 0 {
			for _, _detail := range successedNotifyDetail {
				if _detail == "" {
					continue
				}
				_info := strings.Split(_detail, "^")
				if len(_info) > 0 {
					_id := _info[0]           //商家流水号
					//_account := _info[1]    //收款方账号
					//_name := _info[2]       //收款账号姓名
					//_amount := _info[3]     //付款金额
					_flag := _info[4]         //成功或失败标识
					_reason := _info[5]       //成功或失败原因
					_alipayno := _info[6]     //支付宝内部流水号
					_time := _info[7]         //完成时间
					insertTime, _ := time.Parse("20060102150405", _time)
					_settledAt := insertTime.Format("2006-01-02 15:04:05")
					_bill := &model.DailyBill{Model:model.Model{Id: functions.StringToInt(_id)}, SettledAt: _settledAt, Status: 2}  //已结账
					_billRel := &model.BillRel{BillId: functions.StringToInt(_id), BatchNo: reqMap["batch_no"], Type: 1, IsSuccessed: true, Reason: _reason, OuterNo: _alipayno}
					if _flag == "S" {
						billList = append(billList, _bill)
						billRelList = append(billRelList, _billRel)
						successedBillIds = append(successedBillIds, functions.StringToInt(_id))
						billIdSettledAtMap[_id] = _settledAt
						successedNum++
					}
				}
			}
		}
	}
	//failure status of alipaybill
	if reqMap["fail_details"] != "" {
		failNotifyDetail = strings.Split(reqMap["fail_details"], "|")
		if len(failNotifyDetail) > 0 {
			for _, _detail := range failNotifyDetail {
				if _detail == "" {
					continue
				}
				_info := strings.Split(_detail, "^")
				if len(_info) > 0 {
					_id := _info[0]
					_flag := _info[4]
					_reason := _info[5]
					_alipayno := _info[6]
					_time := _info[7]
					insertTime, _ := time.Parse("20060102150405", _time)
					_settledAt := insertTime.Format("2006-01-02 15:04:05")
					_bill := &model.DailyBill{Model:model.Model{Id: functions.StringToInt(_id)}, SettledAt: _settledAt, Status: 4}  //结账失败
					_billRel := &model.BillRel{BillId: functions.StringToInt(_id), BatchNo: reqMap["batch_no"], Type: 1, IsSuccessed: false, Reason: _reason, OuterNo: _alipayno}
					if _flag == "F" {
						failureList = append(failureList, _bill)
						billRelList = append(billRelList, _billRel)
						failureBillIds = append(failureBillIds, functions.StringToInt(_id))
						billIdSettledAtMap[_id] = _settledAt
						failureNum++
					}
				}
			}
		}
		billList = append(billList, failureList...)
	}
	common.Logger.Debugln("list==============", billList)
	if len(billList) <= 0 {
		common.Logger.Warningln("返回数据没有账单详情")
		ctx.Response.SetBodyString("fail")
		return
	}

	//用于更新旧系统数据
	if len(successedBillIds) > 0 {
		mnznSuccessedBillList, err := BasicMnznBillLists(true, &billIdSettledAtMap, successedBillIds...)
		if err != nil {
			common.Logger.Debugln(daily_bill_msg["01060504"], ":", err.Error())
			result := &enity.Result{"01060504", err.Error(), daily_bill_msg["01060504"]}
			common.Log(ctx, result)
			ctx.Response.SetBodyString("fail")
			return
		}
		mnznBillList = append(mnznBillList, mnznSuccessedBillList...)
	}
	if len(failureBillIds) > 0 {
		mnznFailureBillList, err := BasicMnznBillLists(false, &billIdSettledAtMap, failureBillIds...)
		if err != nil {
			common.Logger.Debugln(daily_bill_msg["01060505"], ":", err.Error())
			result := &enity.Result{"01060505", err.Error(), daily_bill_msg["01060505"]}
			common.Log(ctx, result)
			ctx.Response.SetBodyString("fail")
			return
		}
		mnznBillList = append(mnznBillList, mnznFailureBillList...)
	}

	if len(mnznBillList) > 0 {
		_, err = dailyBillService.Updates(&billList, mnznBillList)
		if err != nil {
			//更新支付宝账单结账状态失败
			common.Logger.Debugln(daily_bill_msg["01060501"], ":", err.Error())
			result := &enity.Result{"01060501", err.Error(), daily_bill_msg["01060501"]}
			common.Log(ctx, result)
			ctx.Response.SetBodyString("fail")
			return
		}
	}
	//软删除失败订单的批次号
	if len(failureBillIds) > 0 {
		_, err = billBatchNoService.Delete(failureBillIds)
		if err != nil {
			common.Logger.Debugln(daily_bill_msg["01060502"], "failureBillIds==", failureBillIds, ":", err.Error())
			result := &enity.Result{"01060502", err.Error(), daily_bill_msg["01060502"]}
			common.Log(ctx, result)
			ctx.Response.SetBodyString("fail")
			return
		}
	}
	//插入支付宝返回的账单信息
	if len(billRelList) > 0 {
		_, err := billRelService.Create(billRelList...)
		if err != nil {
			common.Logger.Debugln(daily_bill_msg["01060503"], ":", err.Error())
			result := &enity.Result{"01060503", err.Error(), daily_bill_msg["01060503"]}
			common.Log(ctx, result)
			ctx.Response.SetBodyString("fail")
			return
		}
	}
	common.Logger.Warningln("======================支付宝回调结束======================")
	common.Log(ctx, nil)
	ctx.Response.SetBodyString("success")
}

func BasicMnznBillLists(isSuccessed bool, billIdSettledAtMap *map[string]string, billIds ...int) ([]map[string]interface{}, error) {
	dailyBillService := &service.DailyBillService{}

	list := make([]map[string]interface{}, 0)
	successedBillMap, err := dailyBillService.BasicMapByIds(billIds...)
	if err != nil {
		return nil, err
	}
	for _, _bill := range successedBillMap {
		mnznBillMap := make(map[string]interface{}, 0)
		mnznBillMap["settledAt"] = (*billIdSettledAtMap)[strconv.Itoa(_bill.Id)]
		mnznBillMap["userId"] = _bill.UserId - 1
		_time, err := time.Parse(time.RFC3339, _bill.BillAt)
		if err != nil {
			common.Logger.Warningln("时间格式转换错误:", err.Error())
			continue
		}
		_billAt := _time.Format("2006-01-02")
		mnznBillMap["billAt"] = _billAt
		common.Logger.Warningln("_bill.BillAt=======================", _bill.BillAt)
		common.Logger.Warningln("mnznBillMap[billAt]===========", mnznBillMap["billAt"])
		if isSuccessed {
			mnznBillMap["status"] = 2
		}else {
			mnznBillMap["status"] = 1
		}

		list = append(list, mnznBillMap)
	}
	common.Logger.Debugln("list============", list)
	return list, nil
}

/**
	取消提交支付宝批量付款申请
 */
func (self *DailyBillController) CancelBatchAliPay(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	billBatchNoService := &service.BillBatchNoService{}
	var result *enity.Result
	sign := ""
	detail_data := ""
	billIds := make([]string, 0)
	param := make(map[string]interface{}, 0)
	var err error
	err = json.Unmarshal(ctx.PostBody(), &param)
	if err != nil {
		common.Logger.Debugln("解析json失败")
		result = &enity.Result{"01060601", err.Error(), daily_bill_msg["01060601"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if param["sign"] == nil {
		common.Logger.Debugln(daily_bill_msg["01060603"], ":", param)
		result = &enity.Result{"01060603", nil, daily_bill_msg["01060603"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	sign = param["sign"].(string)
	delete(param, "sign")
	if param["sign_type"] != nil {
		delete(param, "sign_type")
	}
	if param["request_url"] != nil {
		delete(param, "request_url")
	}
	if !alipay.VerifySign(param, sign) {
		common.Logger.Debugln("校验不通过")
		result = &enity.Result{"01060601", nil, daily_bill_msg["01060601"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if param["detail_data"] == nil {
		common.Logger.Debugln(daily_bill_msg["01060603"], ":", param)
		result = &enity.Result{"01060603", nil, daily_bill_msg["01060603"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	detail_data = param["detail_data"].(string)
	details := strings.Split(detail_data, "|")
	for _, _detail := range details {
		info := strings.Split(_detail, "^")
		billIds = append(billIds, info[0])
	}
	if len(billIds) <= 0 {
		common.Logger.Debugln(daily_bill_msg["01060602"])
		result = &enity.Result{"01060602", nil, daily_bill_msg["01060602"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	//两个更新暂时没有保持事务
	_, err = dailyBillService.BatchUpdateStatusById(1, billIds)      //将"结算中"的状态改成"已申请"
	if err != nil {
		common.Logger.Debugln("更新账单状态'结算中'为'已申请'失败:", billIds)
		result = &enity.Result{"01060601", err.Error(), daily_bill_msg["01060601"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	_, err = billBatchNoService.Delete(billIds)
	if err != nil {
		common.Logger.Debugln("取消批次号绑定失败:", billIds)
		result = &enity.Result{"01060601", err.Error(), daily_bill_msg["01060601"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01060600", nil, daily_bill_msg["01060600"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

/**
	定时修改"未结算"的支付宝账单状态为"已申请"
 */
/*func (self *DailyBillController) TimedApplyBill() {
	common.Logger.Warningln("=============定时更新'未结账'支付宝账单状态'已申请'开始=============")
	dailyBillService := &service.DailyBillService{}
	userCashAccountService := &service.UserCashAccountService{}
	userIds := make([]int, 0)
	var err error
	accountList, err := userCashAccountService.List(1, 2, 3)  //支付宝账户
	if err != nil {
		common.Logger.Warningln("获取支付宝结账用户失败:", err.Error())
	}
	for _, _account := range *accountList {
		userIds = append(userIds, _account.UserId)
	}
	_, err = dailyBillService.UpdateStatusByUserIdAndStatus(0, 1, userIds...)
	if err != nil {
		common.Logger.Warningln("更新支付宝账单状态失败:", err.Error())
	}
	common.Logger.Warningln("=============定时更新'未结账'支付宝账单状态'已申请'结束=============")
}*/

func (self *DailyBillController) TimedUpdateAliPayStatus() {
	common.Logger.Warningln("=============定时解绑支付宝'结账中'状态超24小时账单开始=============")
	dailyBillService := &service.DailyBillService{}
	billBatchNoService := &service.BillBatchNoService{}
	var err error
	billIds := make([]int, 0)

	submitTime := time.Now().Local().AddDate(0, 0, -1).Format("2006-01-02 15:04:05")
	common.Logger.Debugln("submitTime===========", submitTime)
	list, err := dailyBillService.BasicBySubmitAtAndStatus(submitTime, 3)
	if err != nil {
		common.Logger.Warningln("BasicBySubmitAtAndStatus=====", err.Error())
		return
	}
	if len(*list) <= 0 {
		common.Logger.Warningln("无'结账中'的支付宝账单")
		return
	}
	for _, _dailyBill := range *list {
		billIds = append(billIds, _dailyBill.Id)
	}
	if len(billIds) <= 0 {
		common.Logger.Warningln("无'结账中'的支付宝账单")
		return
	}

	//两个更新暂时没有保持事务
	_, err = dailyBillService.BatchUpdateStatusById(1, billIds)      //将"结算中"的状态改成"已申请"
	if err != nil {
		common.Logger.Warningln("更新账单状态'结算中'为'已申请'失败:", billIds, " ,err:", err.Error())
		return
	}
	_, err = billBatchNoService.Delete(billIds)
	if err != nil {
		common.Logger.Warningln("取消批次号绑定失败:", billIds, " ,err:", err.Error())
		return
	}
	common.Logger.Warningln("=============定时解绑支付宝'结账中'状态超24小时账单结束=============")
}

func (self *DailyBillController) Recharge(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	result := &enity.Result{}
	list, err := dailyBillService.Recharge()
	if err != nil {
		result = &enity.Result{"1", err.Error(), "拉取充值数据异常"}
	} else {
		result = &enity.Result{"0", list, "拉取充值数据成功"}
	}
	ctx.JSON(iris.StatusOK, result)
}

func (self *DailyBillController) Consume(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	result := &enity.Result{}
	list, err := dailyBillService.Consume()
	if err != nil {
		result = &enity.Result{"1", err.Error(), "拉取消费数据异常"}
	} else {
		result = &enity.Result{"0", list, "拉取消费数据成功"}
	}
	ctx.JSON(iris.StatusOK, result)
}
func (self *DailyBillController) SumByDate(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	result := &enity.Result{}
	type List struct {
		Bill       interface{} `json:"all"`
		WeChatBill interface{} `json:"wechat"`
		AliPayBill interface{} `json:"alipay"`
	}
	bill, err := dailyBillService.SumByDate()
	weChatBill, err := dailyBillService.WechatBillByDate()
	aliPayBill, err := dailyBillService.AlipayBillByDate()
	list := &List{bill, weChatBill, aliPayBill}
	if err != nil {
		result = &enity.Result{"1", err.Error(), "拉取账单数据异常"}
	} else {
		result = &enity.Result{"0", list, "拉取账单数据成功"}
	}
	ctx.JSON(iris.StatusOK, result)
}

func (self *DailyBillController) Mark(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	result := &enity.Result{}
	params := ctx.URLParams()
	id, _ := strconv.Atoi(params["id"])
	if id == 0 {
		result = &enity.Result{"01060703", nil, daily_bill_msg["01060703"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	boo, err := dailyBillService.Mark(id)
	if boo {
		result = &enity.Result{"01060700", nil, daily_bill_msg["01060700"]}
	} else {
		result = &enity.Result{"01060701", err.Error(), daily_bill_msg["01060701"]}
	}
	ctx.JSON(iris.StatusOK, result)
}

func (self *DailyBillController) Export(ctx *iris.Context) {
	dailyBillExport := &export.DailyBillExport{}
	dailyBillService := &service.DailyBillService{}
	result := &enity.Result{}
	s := ctx.URLParam("status")
	searchStr := ctx.URLParam("searchStr")
	startAt := ctx.URLParam("startAt")
	endAt := ctx.URLParam("endAt")
	cashAccountType := functions.StringToInt(ctx.URLParam("cashAccountType"))
	signinUserId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	status, userId, roleId, err := dailyBillService.Permission(s, signinUserId)
	if err != nil {
		result = &enity.Result{"01060802", err.Error(), daily_bill_msg["01060802"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	list, err := dailyBillService.ListWithAccountType(cashAccountType, status, userId, searchStr, 0, 0, roleId, startAt, endAt)
	if err != nil {
		result = &enity.Result{"01060803", err.Error(), daily_bill_msg["01060803"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	file, err := dailyBillExport.Excel(roleId, list)
	if err != nil {
		result = &enity.Result{"01060801", err.Error(), daily_bill_msg["01060801"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	common.Log(ctx, nil)
	sendFile := "//" + viper.GetString("server.domain") + viper.GetString("export.loadsPath") + "/" + file
	common.Logger.Debug("=======", sendFile)
	ctx.JSON(iris.StatusOK, &enity.Result{"01060800", sendFile, daily_bill_msg["01060800"]})
}
