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
	"time"
	"maizuo.com/soda-manager/src/server/kit/alipay"
	"os"
	"maizuo.com/soda-manager/src/server/model"
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
		"01060411": "所选支付宝账单中存在已有批次号账单",

		"01060500": "更新账单成功",
		"01060501": "更新账单失败",
	}
)

func (self *DailyBillController) List(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	userRoleRelService := &service.UserRoleRelService{}
	result := &enity.Result{}
	params := ctx.URLParams()
	page := functions.StringToInt(params["page"])
	perPage := functions.StringToInt(params["perPage"])
	cashAccountType := functions.StringToInt(params["cashAccountType"])      //提现方式
	var status []string
	var _status []string
	userId := -1
	if params["status"] != "" {
		_status = strings.Split(params["status"], ",")  //结算状态和提现状态
	}

	signinUserId := ctx.Session().GetInt(viper.GetString("server.session.user.id")) //对角色判断
	userRoleRel, err := userRoleRelService.BasicByUserId(signinUserId)
	if err != nil {
		result = &enity.Result{"01060103", nil, daily_bill_msg["01060103"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if len(_status) <= 0 {
		switch userRoleRel.RoleId {
		case 1:
			status = _status
			break
		case 3:
			status = append(status, []string{"1","2","3","4"}...)
			break
		default:
			userId = signinUserId
			break
		}
	} else {
		for _, s := range _status {
			switch userRoleRel.RoleId {
			case 1:
				status = append(status, s)
				break
			case 3:
				if s == "1" || s == "2" || s == "3" || s == "4"{    //1:银行已申请的账单, 2:银行和支付宝已结账的订单, 3:支付宝结账中的订单, 4:支付宝结算失败的订单
					status = append(status, s)
				}
				break
			default:
				status = append(status, s)
				userId = signinUserId
				break
			}
		}
	}
	if userRoleRel.RoleId == 3 && len(status) <= 0 {
		status = append(status, []string{"1","2","3","4"}...)
	}
	billAt := params["billAt"]

	if page <= 0 || perPage <= 0 {
		ctx.JSON(iris.StatusOK, &enity.Result{"01060104", nil, daily_bill_msg["01060104"]})
		return
	}

	total, err := dailyBillService.TotalByAccountType(cashAccountType, status, billAt, userId)
	if err != nil {
		result = &enity.Result{"01060102", nil, daily_bill_msg["01060102"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	list, err := dailyBillService.ListWithAccountType(cashAccountType, status, billAt, userId, page, perPage)
	if err != nil {
		result = &enity.Result{"01060101", nil, daily_bill_msg["01060101"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01060100", &enity.Pagination{total, list}, daily_bill_msg["01060100"]}
	common.Log(ctx, nil)
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
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	list, err := dailyBillDetailService.ListByUserIdAndBillAt(userId, billAt, page, perPage)
	if err != nil {
		result = &enity.Result{"01060201", nil, daily_bill_msg["01060201"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01060200", &enity.Pagination{total, list}, daily_bill_msg["01060200"]}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

/**
	申请结账
 */
func (self *DailyBillController) Apply(ctx *iris.Context) {
	result := &enity.Result{}
	dailyBillService := &service.DailyBillService{}
	userCashAccountService := &service.UserCashAccountService{}
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
	account, err := userCashAccountService.BasicByUserId(functions.StringToInt(userIds[0]))
	if err != nil {
		common.Logger.Debugln(daily_bill_msg["01060305"], ":", err.Error())
		result := &enity.Result{"01060305", nil, daily_bill_msg["01060305"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if account.Type != 3 {
		result = &enity.Result{"01060306", nil, daily_bill_msg["01060306"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}

	rows, err := dailyBillService.BatchUpdateStatus(status, billAt, userIds...)
	if err != nil {
		result = &enity.Result{"01060302", nil, daily_bill_msg["01060302"]}
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

/*
	支付宝批量支付接口
*/
func BatchAliPay(batchNum int, aliPayDetailDataStr string) map[string]string {
	param := make(map[string]string, 0)
	if batchNum <=0 || batchNum>1000 || aliPayDetailDataStr == ""{
		return param
	}
	if strings.HasSuffix(aliPayDetailDataStr, "|") {
		aliPayDetailDataStr = aliPayDetailDataStr[:len(aliPayDetailDataStr)-1]
	}
	common.Logger.Debugln("aliPayDetailDataStr====================", aliPayDetailDataStr)
	param["service"] = "batch_trans_notify"
	param["partner"] = os.Getenv("ALIPAYID")
	param["_input_charset"] = "utf-8"
	param["notify_url"] = "http://a4bff7d7.ngrok.io/api/daily-bill/alipay/notification"
	param["account_name"] = "深圳市华策网络科技有限公司"
	param["detail_data"] = aliPayDetailDataStr
	param["batch_no"] = time.Now().Local().Format("20060102150405")
	param["batch_num"] = strconv.Itoa(batchNum)
	param["batch_fee"] = "0.02"
	param["email"] = "laura@maizuo.com"
	param["pay_date"] = time.Now().Local().Format("20060102")
	param["sign"] = alipay.CreateSign(param)
	param["sign_type"] = "MD5"
	param["request_url"] = "https://mapi.alipay.com/gateway.do"
	common.Logger.Debugln("param======================", param)

	return param
}

func (self *DailyBillController) BatchPay(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	userCashAccountService := &service.UserCashAccountService{}
	userRoleRelService := &service.UserRoleRelService{}
	billBatchNoService := &service.BillBatchNoService{}
	aliPayBillIds := make([]int, 0)
	billBatchNoList := make([]*model.BillBatchNo, 0)
	batchNum := 0
	var result *enity.Result
	var aliPayReqParam map[string]string
	aliPayDetailDataStr := ""
	siginUserId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))

	userRoleRel, err := userRoleRelService.BasicByUserId(siginUserId)
	if err != nil {
		result = &enity.Result{"01060405", nil, daily_bill_msg["01060405"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if userRoleRel.RoleId != 3 {    //不是财务角色
		ctx.JSON(iris.StatusOK, &enity.Result{"01060406", nil, daily_bill_msg["01060406"]})
		return
	}

	var params map[string]interface{}
	if json.Unmarshal(ctx.PostBody(), &params) != nil {
		common.Logger.Debugln("解析json异常")
		ctx.JSON(iris.StatusOK, &enity.Result{"01060408", nil, daily_bill_msg["01060408"]})
		return
	}
	if params["params"] == nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"01060409", nil, daily_bill_msg["01060409"]})
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
			common.Logger.Debugln("billAt=", billAt, "==>userIdStr=", userIdStr)
			continue
		}
		userIds := strings.Split(userIdStr, ",")
		accountMap, err := userCashAccountService.BasicMapByUserId(userIds)     //按天查出管理员所选当天的所有用户结算账号信息
		if err != nil || len(accountMap) <= 0 {
			common.Logger.Debugln(billAt, "==>", daily_bill_msg["01060404"])
			result = &enity.Result{"01060404", nil, daily_bill_msg["01060404"]}
			common.Log(ctx, result)
			continue        //查询不到用户的账户信息就没有必要往下执行
		}

		//过滤掉未申请提现的用户
		billMap, err := dailyBillService.BasicMap(billAt, 1, userIds...)
		if err == nil  && len(billMap) > 0 {
			for _userId, _dailyBill := range billMap {
				switch accountMap[_userId].Type {
				case 1:                                                 //查询支付宝"已申请"的账单(后台自动将未结算改成已申请)
					AliPayBillMap[_userId] = _dailyBill
					aliPayUserIds = append(aliPayUserIds, strconv.Itoa(_userId))
				case 3:                                                 //查询出银行结算方式中已申请提现的用户(只有银行有已提现状态)
					bankPayBillMap[_userId] = _dailyBill
					bankPayUserIds = append(bankPayUserIds, strconv.Itoa(_userId))
				}
			}
			common.Logger.Debugln(billAt, "==>bankPayUserIds:", bankPayUserIds)
		}

		aliPayFailureBillMap, err := dailyBillService.BasicMap(billAt, 4, userIds...)   //查询出支付宝结算方式中失败的账单
		if err == nil && len(aliPayFailureBillMap)>0 {
			for _userId, _dailyBill := range aliPayFailureBillMap {
				if accountMap[_userId].Type == 1 {      //判断账号是否为支付宝
					AliPayBillMap[_userId] = _dailyBill
					aliPayUserIds = append(aliPayUserIds, strconv.Itoa(_userId))
				}
			}
			common.Logger.Debugln(billAt, "==>aliPayUserIds:", aliPayUserIds)
		}

		//aliPay bill
		if len(aliPayUserIds) > 0 {
			for _, _userId := range aliPayUserIds {
				_userCashAccount :=accountMap[functions.StringToInt(_userId)]
				_dailyBill := AliPayBillMap[functions.StringToInt(_userId)]
				if _userCashAccount != nil && _userCashAccount.Type == 1 && _dailyBill != nil {         //判断结算方式是否为支付宝且存在该用户账单
					//" + strconv.Itoa(_dailyBill.TotalAmount) + "
					aliPayDetailDataStr += strconv.Itoa(_dailyBill.Id) + "^" + _userCashAccount.Account + "^" + _userCashAccount.RealName +
						"^" +  "0.02" + "^" + "无" + "|"          //组装支付宝支付data_detail
					aliPayBillIds = append(aliPayBillIds, _dailyBill.Id)//组装需要修改为"结账中"状态的支付宝订单
					batchNum++      //计算批量结算请求中支付宝结算的日订单数,不可超过1000
				}
			}

		}
		//update bankPay
		if len(bankPayUserIds) > 0 {
			rows, err := dailyBillService.BatchUpdateStatus(2, billAt, bankPayUserIds...)        //新旧系统的订单id不一致,所以分开更新
			if err != nil {
				common.Logger.Debugln(billAt, "==>", daily_bill_msg["01060401"], ":", err.Error())
				result = &enity.Result{"01060401", nil, daily_bill_msg["01060401"]}
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
		ctx.JSON(iris.StatusOK, result)
		return
	}

	//生成支付宝请求参数并存储账单对应的批次号
	if batchNum > 0 && batchNum <= 1000 && aliPayDetailDataStr != "" {
		aliPayReqParam = BatchAliPay(batchNum, aliPayDetailDataStr)
		if aliPayReqParam["batch_no"] == "" {
			common.Logger.Debugln("生成批次号失败:", err.Error())
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
			common.Logger.Debugln("生成批次号信息失败:", err.Error())
			result = &enity.Result{"01060402", nil, daily_bill_msg["01060402"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
		_, err := billBatchNoService.BatchCreate(&billBatchNoList)
		if err != nil {
			common.Logger.Debugln("持久化批次号失败:", err.Error())
			result = &enity.Result{"01060402", nil, daily_bill_msg["01060402"]}
			common.Log(ctx, result)
			ctx.JSON(iris.StatusOK, result)
			return
		}
	}else if (batchNum <= 0 || batchNum > 1000) && aliPayDetailDataStr != "" {
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
		result = &enity.Result{"01060402", nil, daily_bill_msg["01060402"]}
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

func (self *DailyBillController) Notification (ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	billBatchNoService := &service.BillBatchNoService{}
	common.Logger.Debugln("支付宝回调开始!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
	notifyRequest := alipay.NotifyRequest{}
	reqMap := make(map[string]interface{}, 0)
	billList := make([]*model.DailyBill, 0)
	failureList := make([]*model.DailyBill, 0)
	failureBillIds := make([]int, 0)
	body := ctx.Request.Body()
	succeedNum := 0
	failureNum := 0
	common.Logger.Debugln("支付宝通知 Body:", string(body))
	err := json.Unmarshal(body, &notifyRequest)
	if err != nil {
		common.Logger.Debugln("解析支付宝回调信息失败!")
		//ctx.Response.SetBodyString("fail")
		ctx.JSON(iris.StatusOK, &enity.Result{})
		return
	}

	reqMap["notify_time"] = notifyRequest.NotifyTime
	reqMap["notify_type"] = notifyRequest.NotifyType
	reqMap["notify_dd"] = notifyRequest.NotifyId
	reqMap["batch_no"] = notifyRequest.BatchNo
	reqMap["pay_user_id"] = notifyRequest.PayUserId
	reqMap["pay_user_name"] = notifyRequest.PayUserName
	reqMap["pay_account_no"] = notifyRequest.PayAccountNo
	reqMap["success_details"] = notifyRequest.SuccessDetails
	reqMap["fail_details"] = notifyRequest.FailDetails
	common.Logger.Debugln("signType=============", notifyRequest.SignType)
	common.Logger.Debugln("reqMap===========================", reqMap)
	if !alipay.VerifySign(reqMap, notifyRequest.Sign) {
		ctx.JSON(iris.StatusOK, &enity.Result{})
		return
	}
	common.Logger.Debugln("success")
	//successed status of alipaybill
	successNotifyDetail := strings.Split(notifyRequest.SuccessDetails, "|")
	if len(successNotifyDetail) > 0 {
		for _, _detail := range successNotifyDetail {
			_info := strings.Split(_detail, "^")
			if len(_info) > 0 {
				_id := _info[0]         //商家流水号
				//_account := _info[1]    //收款方账号
				//_name := _info[2]       //收款账号姓名
				//_amount := _info[3]     //付款金额
				_flag := _info[4]       //成功或失败标识
				//_reason := _info[5]     //成功或失败原因
				//_alipayno := _info[6]   //支付宝内部流水号
				_time := _info[7]       //完成时间
				_bill := &model.DailyBill{Model:model.Model{Id: functions.StringToInt(_id)}, SettledAt: _time, Status: 2}  //已结账
				if _flag == "S" {
					billList = append(billList, _bill)
					succeedNum++
				}
			}
		}
	}

	//failure status of alipaybill
	failNotifyDetail := strings.Split(notifyRequest.FailDetails, "|")
	if len(failNotifyDetail) > 0 {
		for _, _detail := range failNotifyDetail {
			_info := strings.Split(_detail, "^")
			if len(_info) > 0 {
				_id := _info[0]
				_flag := _info[4]
				_time := _info[7]
				_bill := &model.DailyBill{Model:model.Model{Id: functions.StringToInt(_id)}, SettledAt: _time, Status: 4}  //结账失败
				if _flag == "F" {
					failureList = append(failureList, _bill)
					failureBillIds = append(failureBillIds, functions.StringToInt(_id))
					failureNum++
				}
			}
		}
	}

	billList = append(billList, failureList...)
	common.Logger.Debugln("list==============", billList)
	billLength := len(successNotifyDetail)+len(failNotifyDetail)
	if billLength != (succeedNum+failureNum) {
		ctx.Render("batch_alipay_notify.html", map[string]interface{}{"msg": "fail"})
		return
	}
	_, err = dailyBillService.Updates(&billList)
	if err != nil { //更新支付宝成功订单失败
		result := &enity.Result{"01060501", nil, daily_bill_msg["01060501"]}
		common.Log(ctx, result)
		ctx.Render("batch_alipay_notify.html", map[string]interface{}{"msg": "fail"})
		return
	}

	//软删除失败订单的批次号
	if len(failureBillIds) > 0 {
		_, err = billBatchNoService.Delete(failureBillIds)
		if err != nil {
			common.Logger.Debugln("软删除支付宝失败订单批次号出错, failureBillIds==", failureBillIds)
			result := &enity.Result{"01060501", nil, daily_bill_msg["01060501"]}
			common.Log(ctx, result)
			ctx.Render("batch_alipay_notify.html", map[string]interface{}{"msg": "fail"})
			return
		}
	}
	//ctx.Response.SetBodyString("success")
	common.Logger.Debugln("支付宝回调结束!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
	common.Log(ctx, nil)
	ctx.Render("batch_alipay_notify.html", map[string]interface{}{"msg": "success"})
}

func (self *DailyBillController) Recharge(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	result := &enity.Result{}
	list, err := dailyBillService.Recharge()
	if err != nil {
		result = &enity.Result{"1", nil, "拉取充值数据异常"}
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
		result = &enity.Result{"1", nil, "拉取消费数据异常"}
	} else {
		result = &enity.Result{"0", list, "拉取消费数据成功"}
	}
	ctx.JSON(iris.StatusOK, result)

}


