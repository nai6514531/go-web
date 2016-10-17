package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"strconv"
)

type DailyBillService struct {
}

func (self *DailyBillService) Total() (int, error) {
	dailyBill := &model.DailyBill{}
	var total int64
	r := common.DB.Model(dailyBill).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return int(total), nil
}

func (self *DailyBillService) TotalByAccountType() (int, error) {
	type Result struct {
		Total int
	}
	result := &Result{}
	sql := "select count(*) as total from  daily_bill bill,cash_account_type cat,user_cash_account uca where " +
		"bill.user_id=uca.user_id and uca.type=cat.id and bill.deleted_at IS NULL"
	r := common.DB.Raw(sql).Scan(result)
	if r.Error != nil {
		return 0, r.Error
	}
	return result.Total, nil
}

func (self *DailyBillService) List(page int, perPage int) (*[]*model.DailyBill, error) {
	list := &[]*model.DailyBill{}
	r := common.DB.Offset((page - 1) * perPage).Limit(perPage).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DailyBillService) ListWithAccountType(page int, perPage int) (*[]*model.DailyBill, error) {
	list := []*model.DailyBill{}
	_offset := strconv.Itoa((page - 1) * perPage)
	_perPage := strconv.Itoa(perPage)
	sql := "select bill.*, cat.id as account_type,cat.name as account_name from daily_bill bill,cash_account_type " +
		"cat,user_cash_account uca where bill.user_id=uca.user_id and uca.type=cat.id and bill.deleted_at IS " +
		"NULL order by bill.id desc limit " + _perPage + " offset " + _offset
	rows, err := common.DB.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		dailyBill := &model.DailyBill{}
		common.DB.ScanRows(rows, dailyBill)
		list = append(list, dailyBill)
	}
	return &list, nil
}

func (self *DailyBillService) Basic(id int) (*model.DailyBill, error) {
	dailyBill := &model.DailyBill{}
	r := common.DB.Where("id = ?", id).First(dailyBill)
	if r.Error != nil {
		return nil, r.Error
	}
	return dailyBill, nil
}

func (self *DailyBillService) BasicByUserIdAndBillAt(userId int, billAt string) (*model.DailyBill, error) {
	dailyBill := &model.DailyBill{}
	r := common.DB.Where("user_id = ? and bill_at = ?", userId, billAt).First(dailyBill)
	if r.Error != nil {
		return nil, r.Error
	}
	return dailyBill, nil
}
