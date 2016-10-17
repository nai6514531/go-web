package model

type DailyBillDetail struct {
	Model
	UserId       int    `json:"user_id"`
	SerialNumber string `json:"serial_number"`
	Amount       int    `json:"amount"`
	PulseType    int    `json:"pulse_type"`
	Status       int    `json:"status"`
	BillAt       string `json:"bill_at"`
}

func (DailyBillDetail) TableName() string {
	return "daily_bill_detail"
}
