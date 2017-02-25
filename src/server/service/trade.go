package service

import (
	"github.com/jinzhu/gorm"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model/soda"
	"maizuo.com/soda-manager/src/server/service/soda"
)

type TradeService struct {
}

func (self *TradeService) TotalOfDevice(serialNumber string, mobile string) (int, error) {
	var total int
	var r *gorm.DB
	if serialNumber != "" {
		r = common.SodaDB_R.Model(&soda.Ticket{}).Where("device_serial = ?", serialNumber).Count(&total)
	} else if mobile != "" {
		r = common.SodaDB_R.Model(&soda.Ticket{}).Where("mobile = ?", mobile).Count(&total)
	}
	if r.Error != nil {
		return 0, r.Error
	}
	return total, nil
}

func (self *TradeService) BasicOfDevice(serialNumber string, mobile string, page int, perPage int) (*[]*map[string]interface{}, error) {
	list := make([]*map[string]interface{}, 0)
	tickets := &[]*soda.Ticket{}
	var r *gorm.DB
	if serialNumber != "" {
		r = common.SodaDB_R.Where("device_serial = ?", serialNumber).Offset((page - 1) * perPage).Limit(perPage).Order("created_timestamp desc").Find(tickets)
	} else if mobile != "" {
		r = common.SodaDB_R.Where("mobile = ?", mobile).Offset((page - 1) * perPage).Limit(perPage).Order("created_timestamp desc").Find(tickets)
	}
	if r.Error != nil {
		return nil, r.Error
	}
	userService := &UserService{}
	deviceService := &DeviceService{}
	for _, ticket := range *tickets {
		m := make(map[string]interface{}, 0)
		user, err := userService.Basic(ticket.OwnerId)
		if err == nil {
			m["user"] = user.Contact
			m["telephone"] = user.Telephone
		}
		device, err := deviceService.BasicBySerialNumber(ticket.DeviceSerial)
		if err == nil {
			m["address"] = device.Address
			m["token"] = device.Password
		}
		m["amount"] = ticket.Value / 100
		m["account"] = ticket.Mobile
		m["pulseType"] = 600 + ticket.DeviceMode
		m["createdAt"] = ticket.CreatedAt
		m["serialNumber"] = ticket.DeviceSerial
		m["ticketId"] = ticket.TicketId
		m["status"] = ticket.Status
		list = append(list, &m)
	}
	return &list, nil
}

func (self *TradeService) Refund(ticketId string, mobile string) (int, error) {
	ticketService := &sodaService.TicketService{}
	walletService := &sodaService.WalletService{}
	ticket, err := ticketService.BasicByTicketId(ticketId)
	if err != nil {
		return 0, err
	}
	tx := common.SodaDB_WR.Begin()
	r := tx.Model(&soda.Ticket{}).Where("ticket_id = ? ", ticket.TicketId).Update("status", 4)
	if r.Error != nil {
		tx.Rollback()
		return 0, r.Error
	}
	wallet, err := walletService.BasicByMobile(mobile)
	if err != nil {
		tx.Rollback()
		return 0, err
	}
	r = tx.Model(&soda.Wallet{}).Where("mobile = ?", mobile).Update("value", wallet.Value+ticket.Value)
	if r.Error != nil {
		tx.Rollback()
		return 0, r.Error
	}
	tx.Commit()
	return 1, nil
}
