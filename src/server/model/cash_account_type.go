package model

type CashAccountType struct {
	Model
	Name string `json:"name"`  //id=1:支付宝 id=2:微信 id=3:银行
}

func (CashAccountType) TableName() string {
	return "cash_account_type"
}
