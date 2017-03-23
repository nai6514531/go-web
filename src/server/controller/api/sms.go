package controller

import (
	"encoding/json"
	"maizuo.com/soda-manager/src/server/kit/sms"
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/common"
	"github.com/spf13/viper"
	"time"
	"github.com/bitly/go-simplejson"
	"strconv"
)

type SmsController struct {}

var (
	sms_msg = map[string]string{
		"01011700": "短信验证码发送成功",
		"01011701": "短信验证码发送失败",
		"01011702": "不存在该用户",
		"01011703": "该用户无手机信息",
		"01011704": "请求发送短信验证码失败",
		"01011705": "服务器异常",
		"01011706": "短信发送失败[未知错误]",
		"01011707": "服务器异常",
		"01011708": "登录账户不能为空",
		"01011709": "发送短信次数已超限",
		"01011710": "手机号格式有误，请检查",
		"01011711": "服务器异常",
		"01011712": "图形验证码不能为空",
		"01011713": "图形验证码已过期",
		"01011714": "图形验证码错误",

		"01011900": "短信校验成功",
		"01011901": "服务器异常",
		"01011902": "服务器异常",
		"01011903": "账户不能为空",
		"01011904": "无该账户信息",
		"01011905": "短信验证码错误，请检查",
		"01011906": "短信验证码不能为空",

	}

)



func (self *SmsController) ResetSmsCodes(ctx *iris.Context) {
	var returnCleanCaptcha = func(re *enity.Result) {
		ctx.Session().Delete(viper.GetString("server.captcha.key"))
		ctx.JSON(iris.StatusOK, re)
	}
	smsService := &service.SmsService{}
	userService := &service.UserService{}
	prefix := viper.GetString("sms.prefix")
	expiration := time.Duration(viper.GetInt("sms.expiration"))
	smsId := viper.GetString("sms.smsId.resetPassword")
	result := &enity.Result{}
	respMap := make(map[string]interface{})
	params := simplejson.New()
	err := ctx.ReadJSON(&params)
	if err != nil {
		result = &enity.Result{"01011707", err, sms_msg["01011707"]}
		returnCleanCaptcha(result)
		common.Log(ctx, result)
		return
	}
	account := params.Get("account").MustString()
	if account == "" {
		result = &enity.Result{"01011708", nil, sms_msg["01011708"]}
		returnCleanCaptcha(result)
		common.Log(ctx, result)
		return
	}

	captcha := params.Get("captcha").MustString()
	if captcha == "" {
		result = &enity.Result{"01011712", nil, sms_msg["01011712"]}
		returnCleanCaptcha(result)
		common.Log(ctx, result)
		return
	}
	captchaKey := viper.GetString("server.captcha.key")
	captchaCache := ctx.Session().GetString(captchaKey)
	if captchaCache == "" {
		//不存在
		result := &enity.Result{"01011713", nil, sms_msg["01011713"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}
	//*图片验证码错误*/
	if captchaCache != captcha {
		result := &enity.Result{"01011714", nil, sms_msg["01011714"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}

	user, err := userService.FindByAccount(account)
	if err != nil {
		result = &enity.Result{"01011702", err.Error(), sms_msg["01011702"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}
	if user.Mobile == "" {
		result = &enity.Result{"01011703", nil, sms_msg["01011703"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}
	common.Logger.Debugln("mobile=======",user.Mobile)
	code := sms.Code()
	response, err := smsService.SmsCodes(code, user.Mobile, "苏打生活", "{\"code\":\"" +code + "\"}", smsId)
	if err != nil {
		result = &enity.Result{"01011701", err.Error(), sms_msg["01011701"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}
	if response.StatusCode != 200 || !response.Ok {
		result = &enity.Result{"01011704", nil, sms_msg["01011704"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}
	if json.Unmarshal(response.Bytes(), &respMap) != nil {
		result = &enity.Result{"01011705", nil, sms_msg["01011705"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}
	if respMap["error_response"] != nil  {
		_map := respMap["error_response"].(map[string]interface{})
		if _map["sub_code"] != "" && _map["sub_code"].(string) == "isv.BUSINESS_LIMIT_CONTROL" {
			result = &enity.Result{"01011709", nil, sms_msg["01011709"]}
			common.Log(ctx, result)
			returnCleanCaptcha(result)
			return
		}
		if _map["sub_code"] != "" && _map["sub_code"].(string) == "isv.MOBILE_NUMBER_ILLEGAL" {
			result = &enity.Result{"01011710", nil, sms_msg["01011710"]}
			common.Log(ctx, result)
			returnCleanCaptcha(result)
			return
		}
		if _map["sub_msg"] != "" {
			common.Logger.Warningln("sub_msg=====", _map["sub_msg"].(string))
		}
		result = &enity.Result{"01011706", nil, sms_msg["01011706"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}

	//存到redis
	motivation := "RESET_PASSWORD"
	key := prefix + motivation + ":" + strconv.Itoa(user.Id)
	common.Logger.Debugln("key-----", key)
	_, err = common.Redis.Set(key, code, time.Minute * expiration).Result()
	if err != nil {
		result = &enity.Result{"01011711", err, sms_msg["01011711"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}

	data := map[string]interface{}{
		"mobile": user.Mobile,
	}
	result = &enity.Result{"01011700", data, sms_msg["01011700"]}
	common.Log(ctx, nil)
	returnCleanCaptcha(result)
}

func (self *SmsController) Verify(ctx *iris.Context) {
	smsService := &service.SmsService{}
	userService := &service.UserService{}
	result := &enity.Result{}
	prefix := viper.GetString("sms.prefix")
	params := simplejson.New()
	err := ctx.ReadJSON(&params)
	if err != nil {
		result = &enity.Result{"01011901", err, sms_msg["01011901"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	motivation := params.Get("motivation").MustString()
	if motivation == "" {
		result = &enity.Result{"01011902", nil, sms_msg["01011902"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	account := params.Get("account").MustString()
	if account == "" {
		result = &enity.Result{"01011903", nil, sms_msg["01011903"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	user, err := userService.FindByAccount(account)
	if err != nil {
		result = &enity.Result{"01011904", err, sms_msg["01011904"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	key := prefix + motivation + ":" + strconv.Itoa(user.Id)
	code := params.Get("code").MustString()
	if code == "" {
		result = &enity.Result{"01011906", nil, sms_msg["01011906"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if !smsService.VerifySmsCodes(key, code) {
		result = &enity.Result{"01011905", nil, sms_msg["01011905"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01011900", nil, sms_msg["01011900"]}
	common.Log(ctx, result)
	ctx.JSON(iris.StatusOK, result)
}
