package alipay

import "time"

/**
	商户后台请求支付宝后台批量支付
 */
type BatchPayRequest struct {
	Service          string  `json:"service"`
	Partner          string  `json:"partner"`
	InputCharset     string  `json:"input_charset"`
	SignType         string  `json:"sign_type"`
	Sign             string  `json:"sign"`
	NotifyUrl        string  `json:"notify_url"`         //可空
	AccountName      string  `json:"account_name"`
	DetailData       string  `json:"detail_data"`
	BatchNo          string  `json:"batch_no"`
	BatchNum         string  `json:"batch_num"`
	BatchFee         string  `json:"batch_fee"`
	Email            string  `json:"email"`
	PayDate          string  `json:"pay_date"`
	BuyerAccountName string  `json:"buyer_account_name"` //可空
	ExtendParam      string  `json:"extend_param"`       //可空
}

/**
	支付宝异步通知商户后台
 */
type NotifyRequest struct {
	NotifyTime     time.Time        `json:"notify_time"`
	NotifyType     string           `json:"notify_type"`
	NotifyId       string           `json:"notify_id"`
	SignType       string           `json:"sign_type"`
	Sign           string           `json:"sign"`
	BatchNo        string           `json:"batch_no"`
	PayUserId      string           `json:"pay_user_id"`
	PayUserName    string           `json:"pay_user_name"`
	PayAccountNo   string           `json:"pay_account_no"`
	SuccessDetails string           `json:"success_details"` //可空
	FailDetails    string           `json:"fail_details"`    //可空
}
