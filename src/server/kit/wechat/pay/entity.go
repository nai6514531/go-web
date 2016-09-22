package pay

type UnifyOrderRequest struct {
	AppId          string `xml:"appid"`
	Body           string `xml:"body"`
	MchId          string `xml:"mch_id"`
	NonceStr       string `xml:"nonce_str"`
	NotifyUrl      string `xml:"notify_url"`
	TradeType      string `xml:"trade_type"`
	SpbillCreateIp string `xml:"spbill_create_ip"`
	TotalFee       int    `xml:"total_fee"`
	OutTradeNo     string `xml:"out_trade_no"`
	Sign           string `xml:"sign"`
}

type UnifyOrderResponse struct {
	ReturnCode string `xml:"return_code"`
	ReturnMsg  string `xml:"return_msg"`
	AppId      string `xml:"appid"`
	MchId      string `xml:"mch_id"`
	NonceStr   string `xml:"nonce_str"`
	Sign       string `xml:"sign"`
	ResultCode string `xml:"result_code"`
	PrepayId   string `xml:"prepay_id"`
	TradeType  string `xml:"trade_type"`
}

type NotifyRequest struct {
	ReturnCode    string `xml:"return_code"`
	ReturnMsg     string `xml:"return_msg"`
	AppId         string `xml:"appid"`
	MchId         string `xml:"mch_id"`
	Nonce         string `xml:"nonce_str"`
	Sign          string `xml:"sign"`
	ResultCode    string `xml:"result_code"`
	OpenId        string `xml:"openid"`
	IsSubscribe   string `xml:"is_subscribe"`
	TradeType     string `xml:"trade_type"`
	BankType      string `xml:"bank_type"`
	TotalFee      int    `xml:"total_fee"`
	FeeType       string `xml:"fee_type"`
	CashFee       int    `xml:"cash_fee"`
	CashFeeType   string `xml:"cash_fee_type"`
	TransactionId string `xml:"transaction_id"`
	OutTradeNo    string `xml:"out_trade_no"`
	Attach        string `xml:"attach"`
	TimeEnd       string `xml:"time_end"`
}

type NotifyResponse struct {
	ReturnCode string `xml:"return_code"`
	ReturnMsg  string `xml:"return_msg"`
}

type NativePayResponse struct {
	ReturnCode string `xml:"return_code"`
	ReturnMsg  string `xml:"return_msg"`
	AppId      string `xml:"appid"`
	MchId      string `xml:"mch_id"`
	NonceStr   string `xml:"nonce_str"`
	PrepayId   string `xml:"prepay_id"`
	ResultCode string `xml:"result_code"`
	ErrCodeDes string `xml:"err_code_des"`
	Sign       string `xml:"sign"`
}

type NativePayRequest struct {
	AppId       string `xml:"appid"`
	OpenId      string `xml:"openid"`
	MchId       string `xml:"mch_id"`
	IsSubscribe string `xml:"is_subscribe"`
	NonceStr    string `xml:"nonce_str"`
	ProductId   string `xml:"product_id"`
	Sign        string `xml:"sign"`
}
