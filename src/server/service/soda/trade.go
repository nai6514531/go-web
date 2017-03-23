package sodaService

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model/soda"
)

type TradeService struct {
}

func (self *TradeService) BasicByOrderId(orderId string) (*soda.Trade, error) {
	trade := &soda.Trade{}
	r := common.SodaDB_R.Where("order_id = ? ", orderId).First(trade)
	if r.Error != nil {
		return nil, r.Error
	}
	return trade, nil
}
