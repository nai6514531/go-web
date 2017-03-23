package sodaService

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model/soda"
)

type OrderService struct {
}

func (self *OrderService) BasicByBillId(billId string) (*soda.Order, error) {
	order := &soda.Order{}
	r := common.SodaDB_R.Where("bill_id = ? ", billId).First(order)
	if r.Error != nil {
		return nil, r.Error
	}
	return order, nil
}
