package model

type CashAccountType struct {
	Model
	Name string `json:"name"`
}

func (CashAccountType) TableName() string {
	return "cash_account_type"
}
