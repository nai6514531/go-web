package wechat

import (
	"github.com/bitly/go-simplejson"
	"strings"
	"github.com/levigross/grequests"
	"maizuo.com/soda-manager/src/server/common"
	"github.com/spf13/viper"
)

type WechatKit struct {

}

func (self *WechatKit) RefundTemplateMsg(ticketId string, params map[string]string, openId string) {
	/*" 您申请的订单已退款到账户余额,请前往苏打生活个人中心查看。"
	"订单编号：20088115853"
	"退款金额：5.8元"
	"点击查看账户余额。"*/
	template := ""
	_data := *simplejson.New()
	//template = "R0WXF9FiH6Nchb70cuZWvlHFInz1GFz4nADUua5BCys"
	template = viper.GetString("resource.wechat.message.refund.template")
	params["first"] = viper.GetString("resource.wechat.message.refund.first")
	params["remark"] = viper.GetString("resource.wechat.message.refund.remark")
	// "http://m.sodalife.club/v1/?channel#/tickets/${id}/callback"
	url := viper.GetString("resource.wechat.message.refund.url")
	url = strings.Replace(url, "${id}", ticketId, -1)
	params["url"] = url

	for k, v := range params {
		_data.Set(k, map[string]string{"value": v})
	}
	self.templateMessage(openId, template, url, &_data)
}

//Send User Template Message
func (*WechatKit)templateMessage(openId string, template string, url string, data interface{}) {

	_json := *simplejson.New()
	// "http://wechat.sodalife.club/user/${openId}/message"
	href := viper.GetString("resource.wechat.message.href")
	href = strings.Replace(href, "${openId}", openId, -1)
	_json.Set("type", "TEMPLATE")
	_json.Set("template", template)
	_json.Set("data", data)
	_json.Set("url", url)
	go func() {
		res, err := grequests.Post(href, &grequests.RequestOptions{
			JSON: &_json,
		})
		if err != nil {
			common.Logger.Warnln("Failed to send wechat template message：", err.Error())
		}
		if res.StatusCode != 200 || !res.Ok {
			common.Logger.Warnln("template message status:", res)
		}
		common.Logger.Debugln("go func=======template message response:", res)
	}()

}
