package soda
import "maizuo.com/soda-manager/src/server/model"
type Order struct {
	model.Model
	PaymentId int `json:"payment_id"`
	PaymentName string `json:"payment_name"`
	OrderId string `json:"order_id"`
	UserId int `json:"user_id"`
	Mobile string `json:"mobile"`
	BillId string `json:"bill_id"`
	Count int `json:"count"`
	Value int `json:"value"`
	Status int `json:"status"`
}

func (Order) TableName() string {
	return "order"
}
