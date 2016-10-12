package model

type DailyBill struct {
	Model
	UserId      int    `json:"user_id"`
	UserName    string `json:"user_name"`
	TotalAmount int    `json:"total_amount"`
	SettledAt   string `json:"settled_at"`
	BillAt      string `json:"bill_at"`
	HasApplied  int    `json:"has_applied"`
	Status      int    `json:"status"`
	OrderCount  int    `json:"order_count"`
}

func (DailyBill) TableName() string {
	return "daily_bill"
}
