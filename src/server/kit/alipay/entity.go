package alipay

import "time"

type BatchPayRequest struct {
	Service          string  `json:"service"`
	Partner          string  `json:"partner"`
	InputCharset     string  `json:"input_charset"`
	SignType         string  `json:"sign_type"`
	Sign             string  `json:"sign"`
	NotifyUrl        string  `json:"notify_url"`         //可空
	AccountName      string  `json:"account_name"`
	DetailData       string  `json:"detail_data"`
	DatchNo          string  `json:"datch_no"`
	DatchNum         string  `json:"datch_num"`
	DatchFee         string  `json:"datch_fee"`
	Email            string  `json:"email"`
	PayDate          string  `json:"pay_date"`
	BuyerAccountName string  `json:"buyer_account_name"` //可空
	ExtendParam      string  `json:"extend_param"`       //可空
}

type NotifyRequest struct {
	notify_time    time.Time       `json:"notify_time"`
	NotifyType     string           `json:"notify_type"`
	NotifyDd       string           `json:"notify_dd"`
	SignType       string           `json:"sign_type"`
	Sign           string           `json:"sign"`
	BatchNo        string           `json:"batch_no"`
	PayUserId      string           `json:"pay_user_id"`
	PayUserName    string           `json:"pay_user_name"`
	PayAccountNo   string           `json:"pay_account_no"`
	SuccessDetails string           `json:"success_details"`        //可空
	FailDetails    string           `json:"fail_details"`           //可空
}
