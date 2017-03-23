package sodaService

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model/soda"
)

type TicketService struct {
}

func (self *TicketService) BasicByTicketId(ticketId string) (*soda.Ticket, error) {
	ticket := &soda.Ticket{}
	r := common.SodaDB_R.Where("ticket_id = ? ", ticketId).First(ticket)
	if r.Error != nil {
		return nil, r.Error
	}
	return ticket, nil
}
