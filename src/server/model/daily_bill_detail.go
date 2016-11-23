package model

type DailyBillDetail struct {
	Model
	UserId       int    `json:"userId"`
	SerialNumber string `json:"serialNumber"`
	Amount       int    `json:"amount"`
	PulseType    int    `json:"pulseType"`
	Status       int    `json:"status"`
	BillAt       string `json:"billAt"`
	WashId       int    `json:"washId"`
}

func (DailyBillDetail) TableName() string {
	return "daily_bill_detail"
}
