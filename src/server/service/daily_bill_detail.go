package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/model/soda"
	"time"
)

type DailyBillDetailService struct {
}

func (self *DailyBillDetailService) Basic(id int) (*model.DailyBillDetail, error) {
	dailyBillDetail := &model.DailyBillDetail{}
	r := common.SodaMngDB_R.Where("id = ?", id).First(dailyBillDetail)
	if r.Error != nil {
		return nil, r.Error
	}
	return dailyBillDetail, nil
}

func (self *DailyBillDetailService) DeleteByBillAt(billAt string) (bool, error) {
	//r := common.DB.Delete(model.DailyBillDetail{},"bill_at > ?", billAt)
	r := common.SodaMngDB_WR.Exec("delete from daily_bill_detail WHERE bill_at > ?", billAt)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}

func (self *DailyBillDetailService) DeleteByUserAndBillAt(userId int, billAt string) (bool, error) {
	r := common.SodaMngDB_WR.Exec("delete from daily_bill_detail WHERE user_id = ? and date(bill_at) = ?", userId, billAt)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}

func (self *DailyBillDetailService) TotalByUserIdAndBillAt(userId int, billAt string, serialNum string) (int, error) {
	t, _ := time.Parse("2006-01-02", billAt)
	tomorrow := t.Local().AddDate(0, 0, 1).Format("2006-01-02")
	var total int64
	sql := `
	owner_id=convert(?,signed)
	and
	created_timestamp>=unix_timestamp(?)
	and
	created_timestamp<unix_timestamp(?)
	and
	status=7
	`
	r := common.SodaDB_R.Model(&soda.Ticket{}).Where(sql, userId, billAt, tomorrow).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return int(total), nil
}

func (self *DailyBillDetailService) ListByUserIdAndBillAt(userId int, billAt string, page int, perPage int, serialNum string) (*[]*soda.Ticket, error) {
	list := &[]*soda.Ticket{}
	t, _ := time.Parse("2006-01-02", billAt)
	tomorrow := t.Local().AddDate(0, 0, 1).Format("2006-01-02")
	sql := `
	owner_id=convert(?,signed)
	and
	created_timestamp>=unix_timestamp(?)
	and
	created_timestamp<unix_timestamp(?)
	and
	status = 7
	`
	r := common.SodaDB_R.Model(&soda.Ticket{}).Where(sql, userId, billAt, tomorrow).Offset((page - 1) * perPage).Limit(perPage).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

/*func (self *DailyBillDetailService) TotalBySerialNumAndBillAt(serialNum string, billAt string) (int, error) {
	dailyBillDetail := &model.DailyBillDetail{}
	var total int64
	r := common.DB.Model(dailyBillDetail).Where("serial_number = ? and date(bill_at) = ?", serialNum, billAt).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return int(total), nil
}

func (self *DailyBillService) ListBySerialNumAndBillAt(serialNum string, billAt string, page int, perPage int) (*[]*model.DailyBillDetail, error) {
	list := &[]*model.DailyBillDetail{}
	r := common.DB.Model(&model.DailyBillDetail{}).Where("serial_number = ? and date(bill_at) = ?", serialNum, billAt).Offset((page - 1) * perPage).Limit(perPage).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}*/
