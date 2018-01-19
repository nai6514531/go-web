package service

import (
	"github.com/jinzhu/gorm"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model/soda"
	"maizuo.com/soda-manager/src/server/service/soda"
)

type TradeService struct {
}

func (self *TradeService) TotalOfDeviceForWangHai(serialNumber string, mobile string) (int, error) {
	var total int
	var r *gorm.DB
	if serialNumber != "" {
		r = common.SodaDB_R.Model(&soda.Ticket{}).Where("device_serial = ? and created_timestamp<unix_timestamp('2018-01-01')  and status in (3,4,5,6,7,9,10) ", serialNumber).Count(&total)
	} else if mobile != "" {
		r = common.SodaDB_R.Model(&soda.Ticket{}).Where("mobile = ? and created_timestamp<unix_timestamp('2018-01-01') and status in (3,4,5,6,7,9,10) ", mobile).Count(&total)
	}
	if r.Error != nil {
		return 0, r.Error
	}
	return total, nil
}

func (self *TradeService) BasicOfDeviceForWangHai(serialNumber string, mobile string, page int, perPage int) (*[]*map[string]interface{}, error) {
	list := make([]*map[string]interface{}, 0)
	tickets := &[]*soda.Ticket{}
	var r *gorm.DB
	if serialNumber != "" {
		r = common.SodaDB_R.Where("device_serial = ? and created_timestamp<unix_timestamp('2018-01-01') and status in (3,4,5,6,7,9,10) ", serialNumber).Offset((page - 1) * perPage).Limit(perPage).Order("created_timestamp desc").Find(tickets)
	} else if mobile != "" {
		r = common.SodaDB_R.Where("mobile = ? and created_timestamp<unix_timestamp('2018-01-01') and status in (3,4,5,6,7,9,10) ", mobile).Offset((page - 1) * perPage).Limit(perPage).Order("created_timestamp desc").Find(tickets)
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
			m["user"] = user.Name
			m["telephone"] = user.Telephone
		}
		device, err := deviceService.BasicBySerialNumber(ticket.DeviceSerial)
		if err == nil {
			m["address"] = device.Address
		}
		m["token"] = ticket.Token
		m["amount"] = float64(ticket.Value) / 100
		m["account"] = ticket.Mobile
		m["pulseType"] = 600 + ticket.DeviceMode
		m["createdAt"] = ticket.CreatedAt
		m["serialNumber"] = ticket.DeviceSerial
		m["ticketId"] = ticket.TicketId
		m["status"] = ticket.Status
		m["ownerId"] = ticket.OwnerId
		m["paymentId"] = ticket.PaymentId
		list = append(list, &m)
	}
	return &list, nil
}

func (self *TradeService) TotalOfDevice(serialNumber string, mobile string) (int, error) {
	var total int
	var r *gorm.DB
	if serialNumber != "" {
		r = common.SodaDB_R.Model(&soda.Ticket{}).Where("device_serial = ? and status in (3,4,5,6,7,9,10) ", serialNumber).Count(&total)
	} else if mobile != "" {
		r = common.SodaDB_R.Model(&soda.Ticket{}).Where("mobile = ? and status in (3,4,5,6,7,9,10) ", mobile).Count(&total)
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
		r = common.SodaDB_R.Where("device_serial = ? and status in (3,4,5,6,7,9,10) ", serialNumber).Offset((page - 1) * perPage).Limit(perPage).Order("created_timestamp desc").Find(tickets)
	} else if mobile != "" {
		r = common.SodaDB_R.Where("mobile = ? and status in (3,4,5,6,7,9,10) ", mobile).Offset((page - 1) * perPage).Limit(perPage).Order("created_timestamp desc").Find(tickets)
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
			m["user"] = user.Name
			m["telephone"] = user.Telephone
		}
		device, err := deviceService.BasicBySerialNumber(ticket.DeviceSerial)
		if err == nil {
			m["address"] = device.Address
		}
		m["token"] = ticket.Token
		m["amount"] = float64(ticket.Value) / 100
		m["account"] = ticket.Mobile
		m["pulseType"] = 600 + ticket.DeviceMode
		m["createdAt"] = ticket.CreatedAt
		m["serialNumber"] = ticket.DeviceSerial
		m["ticketId"] = ticket.TicketId
		m["status"] = ticket.Status
		m["ownerId"] = ticket.OwnerId
		m["paymentId"] = ticket.PaymentId
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
	r = tx.Create(&soda.Bill{
		Mobile:   mobile,
		UserID:   wallet.UserId,
		WalletID: wallet.Id,
		Title:    "退款",
		Value:    ticket.Value,
		Type:     4,
		Action:   1,
		Status:   0,
	})
	if r.Error != nil {
		tx.Rollback()
		return 0, r.Error
	}
	tx.Commit()
	return 1, nil
}
