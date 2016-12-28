package service

import (
	"time"
	"maizuo.com/soda-manager/src/server/kit/sms"
	"github.com/levigross/grequests"
	"github.com/spf13/viper"
)

type SmsService struct {
}

func (self *SmsService) SendMsg(code string, mobile string, smsFreeSignName string, smsParam string, smsTemplateCode string) (*grequests.Response, error) {
	param := make(map[string]string, 0)
	param["method"] = viper.GetString("sms.method")
	param["app_key"] = viper.GetString("sms.mng.appKey")
	param["sign_method"] = "md5"
	//param["session"] = ""
	param["timestamp"] = time.Now().Local().Format("2006-01-02 15:04:05")
	param["format"] = "json"
	param["v"] = "2.0"

	//param["extend"] = "9303"
	param["sms_type"]= "normal"
	param["sms_free_sign_name"] = smsFreeSignName
	param["sms_param"] = smsParam
	param["rec_num"] = mobile
	param["sms_template_code"] = smsTemplateCode
	param["sign"] = sms.CreateSign(viper.GetString("sms.mng.appSecret"), param)

	response, err := grequests.Post(viper.GetString("sms.requestUrl"), &grequests.RequestOptions{
		Params: param,
		Headers: map[string]string{
			"Content-Type":"multipart/form-data;charset=utf-8",
		},
	})
	return response, err
}

func (self *SmsService) verifyMsg() (bool, error) {
	return true, nil
}
