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
	"github.com/levigross/grequests"
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
		"01060401": "日账单结账失败",
		"01060402": "日账单部分结账失败",
		"01060403": "所选中的银行结算用户未申请提现或已结账",
		"01060404": "无选中用户账户信息",
		"01060405": "无登陆用户角色信息",
		"01060406": "无操作权限",
		"01060407": "所选中的支付宝结算用户无结算失败日账单",
		"01060408": "解析json异常",
		"01060409": "传参json异常",
		"01060410": "银行结算更新失败",
		"01060411": "银行结算部分更新失败",
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

	rows, err := dailyBillService.UpdateStatus(status, billAt, userIds...)
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
func BatchAliPay(batchNum int, aliPayDetailDataStr string) bool {
	if batchNum <=0 || batchNum>1000 || aliPayDetailDataStr == ""{
		return false
	}
	param := make(map[string]string, 0)
	if strings.HasSuffix(aliPayDetailDataStr, "|") {
		aliPayDetailDataStr = aliPayDetailDataStr[:len(aliPayDetailDataStr)-1]
	}
	common.Logger.Debugln("aliPayDetailDataStr====================", aliPayDetailDataStr)
	param["service"] = "batch_trans_notify"
	param["partner"] = os.Getenv("ALIPAYID")
	param["_input_charset"] = "utf-8"
	param["notify_url"] = "http://6a22d7ad.ngrok.io/api/daily-bill/alipay/notification"
	param["account_name"] = "深圳市华策网络科技有限公司"
	param["detail_data"] = aliPayDetailDataStr
	param["batch_no"] = time.Now().Local().Format("20060102150405")
	param["batch_num"] = strconv.Itoa(batchNum)
	param["batch_fee"] = "0.02"
	param["email"] = "laura@maizuo.com"
	param["pay_date"] = time.Now().Local().Format("20060102")
	param["sign"] = alipay.CreateSign(param, 2)
	param["sign_type"] = "MD5"

	common.Logger.Debugln("param======================", param)

	response, err := grequests.Get("https://mapi.alipay.com/gateway.do", &grequests.RequestOptions{
		Params: param,
		Headers:map[string]string{
			//"Accept": "application/json;charset=utf-8",
			"Content-Type": "text/html;charset=utf-8",
		},
	})
	if err != nil {

	}
	common.Logger.Debugln("```````````````````````",response.Error)
	common.Logger.Debugln("```````````````````````",response.Ok)
	common.Logger.Debugln("```````````````````````",response.StatusCode)
	common.Logger.Debugln("```````````````````````",response.String())

	/*cd, err := iconv.Open("utf-8", "gbk")
	if err != nil {
		fmt.Println("iconv.Open failed!")
		return false
	}
	defer cd.Close()

	utf := cd.ConvString(response.String())

	fmt.Println(utf)*/

	return true
}

func (self *DailyBillController) BatchPay(ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	userCashAccountService := &service.UserCashAccountService{}
	userRoleRelService := &service.UserRoleRelService{}
	batchNum := 0
	var result *enity.Result
	aliPayDetailDataStr := ""
	isSuccessed := true
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

		_map := _param.(map[string]interface{})
		if _map["userId"] == nil || _map["billAt"] == nil {
			continue
		}
		userIdStr := _map["userId"].(string)
		billAt := _map["billAt"].(string)
		if userIdStr == "" || billAt == "" {
			common.Logger.Debugln("billAt=", billAt, "===>", "userIdStr=", userIdStr)
			continue
		}
		userIds := strings.Split(userIdStr, ",")
		//过滤掉未申请提现的用户
		bankBillMap, err := dailyBillService.BasicMap(billAt, 1, userIds...)        //查询出银行结算方式中已申请提现的用户(只有银行有已提现状态)
		if err == nil  && len(*bankBillMap) > 0 {
			for _userId, _ := range *bankBillMap {
				bankPayUserIds = append(bankPayUserIds, strconv.Itoa(_userId))
			}
			common.Logger.Debugln(billAt, "==>bankPayUserIds:", bankPayUserIds)

		}/*else {
			common.Logger.Debugln(billAt, "==>", daily_bill_msg["01060403"])
			result = &enity.Result{"01060403", nil, daily_bill_msg["01060403"]}
			common.Log(ctx, result)
		}*/

		aliPayFailureBillMap, err := dailyBillService.BasicMap(billAt, 4, userIds...)   //查询出支付宝结算方式中失败的账单
		if err == nil  && len(*aliPayFailureBillMap) > 0 {
			for _userId, _ := range *aliPayFailureBillMap {
				aliPayUserIds = append(aliPayUserIds, strconv.Itoa(_userId))
			}
			common.Logger.Debugln(billAt, "==>aliPayUserIds:", aliPayUserIds)
		}/*else {
			common.Logger.Debugln(billAt, "==>", daily_bill_msg["01060407"])
			result = &enity.Result{"01060407", nil, daily_bill_msg["01060407"]}
			common.Log(ctx, result)
		}*/

		accountMap, err := userCashAccountService.BasicMapByUserId(userIds)     //按天查出管理员所选当天的所有用户结算账号信息
		if err != nil || len(*accountMap) <= 0 {
			common.Logger.Debugln(billAt, "==>", daily_bill_msg["01060404"])
			result = &enity.Result{"01060404", nil, daily_bill_msg["01060404"]}
			common.Log(ctx, result)
			continue        //查询不到用户的账户信息就没有必要往下执行
		}
		//aliPay bill
		if len(aliPayUserIds) > 0 {
			for _, _userId := range aliPayUserIds {
				_userCashAccount := (*accountMap)[functions.StringToInt(_userId)]
				_dailyBill := (*aliPayFailureBillMap)[functions.StringToInt(_userId)]
				if _userCashAccount != nil && _userCashAccount.Type == 1 && _dailyBill != nil {         //判断结算方式是否为支付宝且存在该用户账单
					//" + strconv.Itoa(_dailyBill.TotalAmount) + "
					aliPayDetailDataStr += strconv.Itoa(_dailyBill.Id) + "^" + _userCashAccount.Account + "^" + _userCashAccount.RealName +
						"^" +  "0.02"+ "^" + "无" + "|"
					batchNum++      //计算批量结算请求中支付宝结算的日订单数,不可超过1000
				}
			}

		}
		//update bankPay
		if len(bankPayUserIds) > 0 {
			rows, err := dailyBillService.UpdateStatus(2, billAt, bankPayUserIds...)        //新旧系统的订单id不一致,所以分开更新
			if err != nil {
				common.Logger.Debugln("银行结算更新失败")
				result = &enity.Result{"01060410", nil, daily_bill_msg["01060410"]}
				common.Log(ctx, result)
				isSuccessed = false
			}
			if rows != len(bankPayUserIds) {
				common.Logger.Debugln("银行结算部分更新失败")
				result = &enity.Result{"01060411", nil, daily_bill_msg["01060411"]}
				common.Log(ctx, result)
				isSuccessed = false
			}
		}
	}

	//发起支付宝请求
	if batchNum > 0 && batchNum <= 1000 && aliPayDetailDataStr != "" {
		paySuccessd := BatchAliPay(batchNum, aliPayDetailDataStr)
		if !paySuccessd {       //支付宝支付失败

		}
	}

	if isSuccessed {
		result = &enity.Result{"01060400", nil, daily_bill_msg["01060400"]}
	} else {
		result = &enity.Result{"01060402", nil, daily_bill_msg["01060402"]}
	}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *DailyBillController) TimedBatchAliPay() {
}


func (self *DailyBillController) Notification (ctx *iris.Context) {
	dailyBillService := &service.DailyBillService{}
	common.Logger.Debugln("支付宝回调开始!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
	notifyRequest := alipay.NotifyRequest{}
	reqMap := make(map[string]interface{}, 0)
	body := ctx.Request.Body()
	common.Logger.Debugln("支付宝通知 Body:", string(body))
	err := json.Unmarshal(body, &notifyRequest)
	if err != nil {
		common.Logger.Debugln("解析支付宝回调信息失败!")
		ctx.Response.SetBodyString("fail")
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
	if alipay.VerifySign(reqMap, notifyRequest.Sign) {
		common.Logger.Debugln("success")
		//update successed status of alipaybill
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
					_bill := &model.DailyBill{SettledAt: _time, Status: 2}  //已结账
					if _flag == "S" {
						rows, err := dailyBillService.Update(functions.StringToInt(_id), _bill)
						if err != nil {

						}
						if rows != 1 {

						}
					}
				}
			}
		}
		//update failure status of alipaybill
		failNotifyDetail := strings.Split(notifyRequest.FailDetails, "|")
		if len(failNotifyDetail) > 0 {
			for _, _detail := range failNotifyDetail {
				_info := strings.Split(_detail, "^")
				if len(_info) > 0 {
					_id := _info[0]
					_flag := _info[4]
					_time := _info[7]
					_bill := &model.DailyBill{SettledAt: _time, Status: 4}  //结账失败
					if _flag == "F" {
						rows, err := dailyBillService.Update(functions.StringToInt(_id), _bill)
						if err != nil {

						}
						if rows != 1 {

						}
					}
				}
			}
		}

		ctx.Response.SetBodyString("success")
	} else {
		ctx.Response.SetBodyString("fail")
	}
	common.Logger.Debugln("支付宝回调结束!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

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

func (self *DailyBillController) UpdateTest(ctx *iris.Context) {
	//id, _ := ctx.URLParamInt("id")
	dailyBillService := &service.DailyBillService{}
	bill := &model.DailyBill{Model:model.Model{Id: 692}, SettledAt: time.Now().Local().Format("2006-01-02 15:04:05"), Status: 1, TotalAmount:2222}
	bill2 := &model.DailyBill{Model:model.Model{Id: 687}, SettledAt: "2016-10-30 12:23:56", Status: 1, TotalAmount: 124}
	list := []*model.DailyBill{bill, bill2}
	rows, err := dailyBillService.Updates(list...)
	if err != nil {
		common.Logger.Debugln(err.Error())
	}
	ctx.JSON(iris.StatusOK, &enity.Result{"1", rows, "haha"})
}
