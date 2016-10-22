package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"strconv"
	"github.com/jinzhu/gorm"
	"maizuo.com/soda-manager/src/server/model/muniu"
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

func (self *DailyBillService) TotalByAccountType(cashAccounType int, status []string, billAt string) (int, error) {
	type Result struct {
		Total int
	}
	result := &Result{}
	params := make([]interface{}, 0)
	sql := "select count(*) as total from  daily_bill bill,cash_account_type cat,user_cash_account uca where " +
		"bill.user_id=uca.user_id and uca.type=cat.id and bill.deleted_at IS NULL"
	if cashAccounType > 0 {
		sql += " and cat.id = ? "
		params = append(params, cashAccounType)
	}
	if len(status) > 0 {
		sql += " and bill.status in (?) "
		params = append(params, status)
	}
	if billAt != "" {
		sql += " and bill.bill_at = ? "
		params = append(params, billAt)
	}

	common.Logger.Debugln("params===========", params)
	r := common.DB.Raw(sql, params...).Scan(result)
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

func (self *DailyBillService) ListWithAccountType(cashAccounType int, status []string, billAt string, page int, perPage int) (*[]*model.DailyBill, error) {
	list := []*model.DailyBill{}
	params := make([]interface{}, 0)
	_offset := strconv.Itoa((page - 1) * perPage)
	_perPage := strconv.Itoa(perPage)
	sql := "select bill.*, cat.id as account_type,cat.name as account_name from daily_bill bill,cash_account_type " +
		"cat,user_cash_account uca where bill.user_id=uca.user_id and uca.type=cat.id and bill.deleted_at IS NULL "
	if cashAccounType > 0 {
		sql += " and cat.id = ? "
		params = append(params, cashAccounType)
	}
	if len(status) > 0 {
		sql += " and bill.status in (?) "
		params = append(params, status)
	}
	if billAt != "" {
		sql += " and bill.bill_at = ? "
		params = append(params, billAt)
	}

	sql += " order by bill.id desc limit " + _perPage + " offset " + _offset
	common.Logger.Debugln("params===========", params)
	rows, err := common.DB.Raw(sql, params...).Rows()
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

func (self *DailyBillService) BasicMap(billAt string, status int, userIds ...string) (*map[int]*model.DailyBill, error) {
	list := &[]*model.DailyBill{}
	dailyBillMap := make(map[int]*model.DailyBill)
	r := common.DB.Where("user_id in (?) and status = ? and bill_at = ?", userIds, status, billAt).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, dailyBill := range *list {
		dailyBillMap[dailyBill.UserId] = dailyBill
	}
	return &dailyBillMap, nil
}

func (self *DailyBillService) UpdateStatus(status int, billAt string, userId ...string) (int64, error) {
	var r *gorm.DB
	tx := common.DB.Begin()
	txmn := common.MNDB.Begin()

	//update mnzn database
	//如果status本来为1,需要更新的也为1时,返回的受影响行数为0
	statusStr := strconv.Itoa(status)
	r = txmn.Model(&muniu.BoxStatBill{}).Where(" COMPANYID in (?) and PERIOD_START = ? ", userId, billAt).Update("STATUS", statusStr)
	if r.Error != nil {
		common.Logger.Warningln(r.Error.Error())
		txmn.Rollback()
		return int64(0), r.Error
	}

	//update soda-manager
	//因为每次update时`updated_at`都会更新
	r = tx.Model(&model.DailyBill{}).Where(" user_id in (?) and bill_at = ? ", userId, billAt).Update("status", status)
	if r.Error != nil {
		common.Logger.Warningln(r.Error.Error())
		tx.Rollback()
		txmn.Rollback()
		return int64(0), r.Error
	}

	tx.Commit()
	txmn.Commit()
	return r.RowsAffected, nil
}
