package model

type UserCashAccount struct {
	Model
	UserId     int    `json:"user_id"`
	Type       int    `json:"type"`
	RealName   string `json:"real_name"`
	BankName   string `json:"bank_name"`
	Account    string `json:"acccount"`
	Mobile     string `json:"mobile"`
	CityId     int    `json:"city_id"`
	ProvinceId int    `json:"province_id"`
}

func (UserCashAccount) TableName() string {
	return "user_cash_account"
}
