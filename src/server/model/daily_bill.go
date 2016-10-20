package model

type DailyBill struct {
	Model
	UserId      int    `json:"userId"`
	UserName    string `json:"userName"`
	TotalAmount int    `json:"totalAmount"`
	SettledAt   string `json:"settledAt"`
	BillAt      string `json:"billAt"`
	//HasApplied  int    `json:"hasApplied"`
	Status      int    `json:"status"`      //0：未结 1：已申请提现 2：已结
	OrderCount  int    `json:"orderCount"`
	AccountType int    `json:"accountType,omitempty" gorm:"-"`
	AccountName string `json:"accountName,omitempty" gorm:"-"`
}

func (DailyBill) TableName() string {
	return "daily_bill"
}
