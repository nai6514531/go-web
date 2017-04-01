package controller

import (
	"encoding/json"
	"github.com/bitly/go-simplejson"
	"github.com/spf13/viper"
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/kit/sms"
	"maizuo.com/soda-manager/src/server/service"
	"strconv"
	"time"
)

type SmsController struct{}

var (
	sms_msg = map[string]string{
		"01091700": "短信验证码发送成功",
		"01091701": "短信验证码发送失败",
		"01091702": "该账号不存在，请检查",
		"01091703": "该用户无手机信息",
		"01091704": "请求发送短信验证码失败",
		"01091705": "服务器异常",
		"01091706": "短信发送失败[未知错误]",
		"01091707": "服务器异常",
		"01091708": "登录账户不能为空",
		"01091709": "发送短信次数已超限",
		"01091710": "手机号格式有误，请联系客服修改",
		"01091711": "服务器异常",
		"01091712": "图形验证码不能为空",
		"01091713": "图形验证码已过期",
		"01091714": "图形验证码错误",

		"01091900": "短信校验成功",
		"01091901": "服务器异常",
		"01091902": "服务器异常",
		"01091903": "账户不能为空",
		"01091904": "该账号不存在，请检查",
		"01091905": "短信验证码错误，请检查",
		"01091906": "短信验证码不能为空",
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
		result = &enity.Result{"01091707", err, sms_msg["01091707"]}
		returnCleanCaptcha(result)
		common.Log(ctx, result)
		return
	}
	account := params.Get("account").MustString()
	if account == "" {
		result = &enity.Result{"01091708", nil, sms_msg["01091708"]}
		returnCleanCaptcha(result)
		common.Log(ctx, result)
		return
	}

	captcha := params.Get("captcha").MustString()
	if captcha == "" {
		result = &enity.Result{"01091712", nil, sms_msg["01091712"]}
		returnCleanCaptcha(result)
		common.Log(ctx, result)
		return
	}
	captchaKey := viper.GetString("server.captcha.key")
	captchaCache := ctx.Session().GetString(captchaKey)
	if captchaCache == "" {
		//不存在
		result := &enity.Result{"01091713", nil, sms_msg["01091713"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}
	//*图片验证码错误*/
	if captchaCache != captcha {
		result := &enity.Result{"01091714", nil, sms_msg["01091714"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}

	user, err := userService.FindByAccount(account)
	if err != nil {
		result = &enity.Result{"01091702", err.Error(), sms_msg["01091702"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}
	if user.Mobile == "" {
		result = &enity.Result{"01091703", nil, sms_msg["01091703"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}
	common.Logger.Debugln("mobile=======", user.Mobile)
	code := sms.Code()
	response, err := smsService.SmsCodes(code, user.Mobile, "苏打生活", "{\"code\":\""+code+"\"}", smsId)
	if err != nil {
		result = &enity.Result{"01091701", err.Error(), sms_msg["01091701"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}
	if response.StatusCode != 200 || !response.Ok {
		result = &enity.Result{"01091704", nil, sms_msg["01091704"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}
	if json.Unmarshal(response.Bytes(), &respMap) != nil {
		result = &enity.Result{"01091705", nil, sms_msg["01091705"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}
	if respMap["error_response"] != nil {
		_map := respMap["error_response"].(map[string]interface{})
		if _map["sub_code"] != "" && _map["sub_code"].(string) == "isv.BUSINESS_LIMIT_CONTROL" {
			result = &enity.Result{"01091709", nil, sms_msg["01091709"]}
			common.Log(ctx, result)
			returnCleanCaptcha(result)
			return
		}
		if _map["sub_code"] != "" && _map["sub_code"].(string) == "isv.MOBILE_NUMBER_ILLEGAL" {
			result = &enity.Result{"01091710", nil, sms_msg["01091710"]}
			common.Log(ctx, result)
			returnCleanCaptcha(result)
			return
		}
		if _map["sub_msg"] != "" {
			common.Logger.Warningln("sub_msg=====", _map["sub_msg"].(string))
		}
		result = &enity.Result{"01091706", nil, sms_msg["01091706"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}

	//存到redis
	motivation := "RESET_PASSWORD"
	key := prefix + motivation + ":" + strconv.Itoa(user.Id)
	common.Logger.Debugln("key-----", key)
	_, err = common.Redis.Set(key, code, time.Minute*expiration).Result()
	if err != nil {
		result = &enity.Result{"01091711", err, sms_msg["01091711"]}
		common.Log(ctx, result)
		returnCleanCaptcha(result)
		return
	}

	data := map[string]interface{}{
		"mobile": user.Mobile,
	}
	result = &enity.Result{"01091700", data, sms_msg["01091700"]}
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
		result = &enity.Result{"01091901", err, sms_msg["01091901"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	motivation := params.Get("motivation").MustString()
	if motivation == "" {
		result = &enity.Result{"01091902", nil, sms_msg["01091902"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	account := params.Get("account").MustString()
	if account == "" {
		result = &enity.Result{"01091903", nil, sms_msg["01091903"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	user, err := userService.FindByAccount(account)
	if err != nil {
		result = &enity.Result{"01091904", err, sms_msg["01091904"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	key := prefix + motivation + ":" + strconv.Itoa(user.Id)
	code := params.Get("code").MustString()
	if code == "" {
		result = &enity.Result{"01091906", nil, sms_msg["01091906"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if !smsService.VerifySmsCodes(key, code) {
		result = &enity.Result{"01091905", nil, sms_msg["01091905"]}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	result = &enity.Result{"01091900", nil, sms_msg["01091900"]}
	common.Log(ctx, result)
	ctx.JSON(iris.StatusOK, result)
}
