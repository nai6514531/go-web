package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/smart-cinema/src/server/service"
	"maizuo.com/smart-cinema/src/server/enity"
	"maizuo.com/smart-cinema/src/server/kit/wechat/pay"
	"encoding/json"
	"maizuo.com/smart-cinema/src/server/common"
	"encoding/xml"
	"maizuo.com/smart-cinema/src/server/model"
	"github.com/spf13/viper"
)

var (
	trade_msg = map[string]string{
		"01070101": "拉取参数异常",

		"01070200": "创建订单二维码成功",
		"01070201": "创建订单二维码失败",
		"01070202": "生成订单号失败",
		"01070203": "生成临时订单失败",

		"01070300": "拉取小票信息成功",
		"01070301": "拉取小票信息失败",
	}
)

type TradeController struct {
}

func (self*TradeController)Unifiedorder(ctx *iris.Context) {
	common.Logger.Warningln(ctx.Request.Body())
}

func (self*TradeController)CreateUnifiedorder(ctx *iris.Context) {
	weChatPayKit := pay.WeChatPayKit{}
	weChatPayKit.CreateUnifiedOrder()
}

func (self *TradeController) Create(ctx *iris.Context) {
	weChatPayKit := pay.WeChatPayKit{}
	tradeService := &service.TradeService{}
	var data map[string]interface{}
	var err error
	ctx.ReadJSON(&data)
	no, err := tradeService.CreateNo()
	if err != nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"01070202", nil, trade_msg["01070202"]})
		return
	}
	hasTemporaryRecordCreated, err := tradeService.CreateTemporaryRecord(data, no)
	if !hasTemporaryRecordCreated&& err != nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"01070203", nil, trade_msg["01070203"]})
		return
	}
	nativePayUrl := weChatPayKit.CreateNativePayURL(no)
	ctx.JSON(iris.StatusOK, &enity.Result{"01070200", nativePayUrl, trade_msg["01070200"]})
}

func (self *TradeController) Temp(ctx *iris.Context) {
	no := ctx.Param("no")
	var err error
	tradeService := &service.TradeService{}
	data, err := tradeService.TemporaryRecordDetail(no)
	if err != nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"01070202", err, trade_msg["01070202"]})
		return
	}
	var _data map[string]interface{}
	json.Unmarshal([]byte(data), &_data)
	ctx.JSON(iris.StatusOK, &enity.Result{"01070200", _data, trade_msg["01070200"]})
}

func (self *TradeController)WeChatCallBack(ctx *iris.Context) {
	var err error
	requestBody := ctx.Request.Body()
	userService := &service.UserService{}
	tradeService := &service.TradeService{}
	if err != nil {
		common.Logger.Warningln("微信支付回调数据读取失败:", err.Error())
		return
	}
	nativePayResponse := pay.NativePayResponse{}
	nativePayRequest := pay.NativePayRequest{}
	err = xml.Unmarshal(requestBody, &nativePayRequest)
	if err != nil {
		common.Logger.Warningln("微信支付回调数据解析失败:", err.Error())
		return
	}
	requestData := make(map[string]interface{}, 0)
	requestData["appid"] = nativePayRequest.AppId
	requestData["openid"] = nativePayRequest.OpenId
	requestData["mch_id"] = nativePayRequest.MchId
	requestData["is_subscribe"] = nativePayRequest.IsSubscribe
	requestData["nonce_str"] = nativePayRequest.NonceStr
	requestData["product_id"] = nativePayRequest.ProductId
	if pay.VerifySign(requestData, nativePayRequest.Sign) {
		nativePayResponse.ReturnCode = "SUCCESS"
		nativePayResponse.ReturnMsg = "OK"
	} else {
		nativePayResponse.ReturnCode = "FAIL"
		nativePayResponse.ReturnMsg = "failed to verify sign, please retry!"
	}
	thirdUserId := nativePayRequest.OpenId
	tradeNo := nativePayRequest.ProductId
	user := &model.User{ChannelId:1, ThirdUserId:thirdUserId}
	user, err = userService.Create(user)
	if err != nil {

	}
	tempTrade, err := tradeService.TemporaryRecordDetail(tradeNo)
	if err != nil {

	}
	var tempTradeMap map[string]interface{}
	json.Unmarshal([]byte(tempTrade), &tempTradeMap)
	trade := &model.Trade{
		UserId:user.Id,
		TradeNo:tradeNo,
	}
	tradeService.Create(trade)
	appId := viper.GetString("pay.wechat.appId")
	mchId := viper.GetString("pay.wechat.mchId")
	nativePayResponse.AppId = appId
	nativePayResponse.MchId = mchId
	nativePayResponse.NonceStr = nativePayRequest.NonceStr
	nativePayResponse.NonceStr = nativePayRequest.NonceStr
}

func (self *TradeController)WeChataSyncNotification(ctx *iris.Context) {

}

/**
	未测,暂不用
 */
func (self *TradeController) DetailOfPrinted(ctx *iris.Context) {
	tradeSercive := &service.TradeService{}
	tradeNo := ctx.Param("tradeno")

	trade, err := tradeSercive.DetailByTradeNo(tradeNo)
	if err != nil {
		ctx.JSON(iris.StatusOK, &enity.Result{"01070301", nil, trade_msg["01070301"]})
		return
	}

	ctx.JSON(iris.StatusOK, &enity.Result{"01070300", trade, trade_msg["01070300"]})
}

