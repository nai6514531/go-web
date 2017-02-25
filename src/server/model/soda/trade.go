package soda
import "maizuo.com/soda-manager/src/server/model"
type Trade struct {
	model.Model
	TradeId string `json:"trade_id"`
	PaymentId int `json:"payment_id"`
	PaymentName string `json:"payment_name"`
	UserId int `json:"user_id"`
	Mobile string `json:"mobile"`
	PaymentAccount string `json:"payment_account"`
	OrderId string `json:"order_id"`
	Count int `json:"count"`
	Value int `json:"value"`
	OutterTradeId string `json:"outter_trade_id"`
	OutterTradeStatus string `json:"outter_trade_status"`
	OutterTradeMessage string `json:"outter_trade_message"`
	Status int `json:"status"`
}

func (Trade) TableName() string {
	return "trade"
}
