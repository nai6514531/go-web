package service

import (
	"github.com/jinzhu/gorm"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/model/muniu"
	"strconv"
	"strings"
	"time"
)

type DailyBillService struct {
}

func (self *DailyBillService) Total() (int, error) {
	dailyBill := &model.DailyBill{}
	var total int64
	r := common.SodaMngDB_R.Model(dailyBill).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return int(total), nil
}

func (self *DailyBillService) TotalByAccountType(cashAccounType int, status []string, userId int, searchStr string, roleId int, startAt string, endAt string) (int, error) {
	type Result struct {
		Total int
	}
	result := &Result{}
	params := make([]interface{}, 0)
	//sql := "select count(*) as total from  daily_bill bill,cash_account_type cat,user_cash_account uca where " +
	//	"bill.user_id=uca.user_id and uca.type=cat.id and bill.deleted_at IS NULL"
	sql := "select count(*) as total from daily_bill bill where bill.deleted_at IS NULL "
	if userId != -1 {
		sql += " and bill.user_id = ? "
		params = append(params, userId)
	}
	if cashAccounType > 0 {
		sql += " and bill.account_type = ? "
		params = append(params, cashAccounType)
	}
	if len(status) > 0 {
		sql += " and bill.status in (?) "
		params = append(params, status)
	}
	if searchStr != "" {
		sql += " and (bill.bank_name like ? or bill.user_name like ? or bill.real_name like ?) "
		params = append(params, "%"+searchStr+"%")
		params = append(params, "%"+searchStr+"%")
		params = append(params, "%"+searchStr+"%")
	}
	if roleId == 3 {
		//财务角色过滤掉测试账号的账单
		sql += " and bill.user_id !=1 "
	}
	if startAt != "" && endAt != "" {
		sql += " and bill.bill_at between ? and ? "
		params = append(params, startAt, endAt)
	}
	common.Logger.Debugln("params===========", params)
	r := common.SodaMngDB_R.Raw(sql, params...).Scan(result)
	if r.Error != nil {
		return 0, r.Error
	}
	return result.Total, nil
}

func (self *DailyBillService) List(page int, perPage int) (*[]*model.DailyBill, error) {
	list := &[]*model.DailyBill{}
	r := common.SodaMngDB_R.Offset((page - 1) * perPage).Limit(perPage).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DailyBillService) ListWithAccountType(cashAccountType int, status []string, userId int, searchStr string, page int, perPage int, roleId int, startAt string, endAt string) (*[]*model.DailyBill, error) {
	list := []*model.DailyBill{}
	params := make([]interface{}, 0)
	_offset := strconv.Itoa((page - 1) * perPage)
	_perPage := strconv.Itoa(perPage)
	//sql := "select bill.*, cat.id as account_type,cat.name as account_name, uca.real_name, uca.bank_name, uca.account, uca.mobile from daily_bill bill,cash_account_type " +
	//	"cat,user_cash_account uca where bill.user_id=uca.user_id and uca.type=cat.id and bill.deleted_at IS NULL "
	sql := "select * from daily_bill bill where bill.deleted_at IS NULL "
	if userId != -1 {
		sql += " and bill.user_id = ? "
		params = append(params, userId)
	}
	if cashAccountType > 0 {
		sql += " and bill.account_type = ? "
		params = append(params, cashAccountType)
	}
	if len(status) > 0 {
		sql += " and bill.status in (?) "
		params = append(params, status)
	}
	if searchStr != "" {
		sql += " and (bill.bank_name like ? or bill.user_name like ? or bill.real_name like ?) "
		params = append(params, "%"+searchStr+"%")
		params = append(params, "%"+searchStr+"%")
		params = append(params, "%"+searchStr+"%")
	}
	if roleId == 3 {
		//财务角色过滤掉测试账号的账单
		sql += " and bill.user_id !=1 "
	}
	if startAt != "" && endAt != "" {
		sql += " and bill.bill_at between ? and ? "
		params = append(params, startAt, endAt)
	}
	sql += " order by bill.has_marked, case " +
		"when bill.status=4 then 1 " +
		"when bill.status=3 then 2 " +
		"when bill.status=1 then 3 " +
		"else 4 end asc, bill.user_id, bill.bill_at DESC, bill.id DESC "
	if perPage > 0 && page > 0 {
		sql += " limit ? offset ? "
		params = append(params, _perPage)
		params = append(params, _offset)
	}
	common.Logger.Debugln("params===========", params)
	rows, err := common.SodaMngDB_R.Raw(sql, params...).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		dailyBill := &model.DailyBill{}
		common.SodaMngDB_R.ScanRows(rows, dailyBill)
		list = append(list, dailyBill)
	}
	return &list, nil
}

func (self *DailyBillService) Basic(id int) (*model.DailyBill, error) {
	dailyBill := &model.DailyBill{}
	r := common.SodaMngDB_R.Where("id = ?", id).First(dailyBill)
	if r.Error != nil {
		return nil, r.Error
	}
	return dailyBill, nil
}

func (self *DailyBillService) BasicMapByIds(id ...int) (map[int]*model.DailyBill, error) {
	list := &[]*model.DailyBill{}
	billMap := make(map[int]*model.DailyBill)
	r := common.SodaMngDB_R.Where("id in (?)", id).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, _bill := range *list {
		billMap[_bill.Id] = _bill
	}
	return billMap, nil
}

func (self *DailyBillService) BasicBySubmitAtAndStatus(submitAt string, status ...int) (*[]*model.DailyBill, error) {
	list := &[]*model.DailyBill{}
	r := common.SodaMngDB_R.Where("submit_at <= ? and status in (?)", submitAt, status).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DailyBillService) BasicByUserIdAndBillAt(userId int, billAt string) (*model.DailyBill, error) {
	dailyBill := &model.DailyBill{}
	r := common.SodaMngDB_R.Where("user_id = ? and bill_at = ?", userId, billAt).First(dailyBill)
	if r.Error != nil {
		return nil, r.Error
	}
	return dailyBill, nil
}

func (self *DailyBillService) BasicMap(billAt string, status int, userIds ...string) (map[int]*model.DailyBill, error) {
	list := &[]*model.DailyBill{}
	dailyBillMap := make(map[int]*model.DailyBill)
	r := common.SodaMngDB_R.Where("user_id in (?) and status = ? and bill_at = ?", userIds, status, billAt).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, dailyBill := range *list {
		dailyBillMap[dailyBill.UserId] = dailyBill
	}
	return dailyBillMap, nil
}

/**
如果参数全为0时有可能出现不会更新的问题
*/
func (self *DailyBillService) Update(id int, dailyBill *model.DailyBill) (int, error) {
	r := common.SodaMngDB_WR.Model(&model.DailyBill{}).Where(" id  = ? ", id).Update(dailyBill)
	if r.Error != nil {
		common.Logger.Debugln(r.Error.Error())
		return 0, r.Error
	}
	return int(r.RowsAffected), nil
}

func (self *DailyBillService) Updates(list *[]*model.DailyBill, mnznList interface{}) (int, error) {
	var r *gorm.DB
	var rows int
	rows = 0
	tx := common.SodaMngDB_WR.Begin()
	for _, _bill := range *list {
		param := map[string]interface{}{
			"id":         _bill.Id,
			"status":     _bill.Status,
			"settled_at": _bill.SettledAt,
		}
		r = tx.Model(&model.DailyBill{}).Where(" id = ? and status != 2 ", _bill.Id).Updates(param)
		if r.Error != nil {
			common.Logger.Warningln(r.Error.Error())
			tx.Rollback()
			return 0, r.Error
		} else {
			rows += int(r.RowsAffected)
		}

	}
	tx.Commit()
	return rows, nil
}

/**
只更新新系统数据
*/
func (self *DailyBillService) BatchUpdateStatusById(status int, ids ...interface{}) (int, error) {
	param := make(map[string]interface{}, 0)
	param["status"] = status
	timeNow := time.Now().Local().Format("2006-01-02 15:04:05")
	if status == 2 {
		param["settled_at"] = timeNow
	}
	if status == 3 {
		//修改状态为"结账中",需更新"结账中时间"
		param["submit_at"] = time.Now()
	}
	r := common.SodaMngDB_WR.Model(&model.DailyBill{}).Where(" id in (?) ", ids...).Update(param)
	if r.Error != nil {
		common.Logger.Warningln(r.Error.Error())
		return 0, r.Error
	}
	return int(r.RowsAffected), nil
}

/**
新旧系统数据库更新
*/
func (self *DailyBillService) BatchUpdateStatus(status int, billAt string, userIds ...string) (int, error) {
	var r *gorm.DB
	//如果status本来为1,需要更新的也为1时,返回的受影响行数为0
	timeNow := time.Now().Local().Format("2006-01-02 15:04:05")
	//因为每次update时`updated_at`都会更新,所以基本上只要操作数据库成功返回受影响的行数都为1
	tx := common.SodaMngDB_WR.Begin()
	//dailyBill := &model.DailyBill{Status: status} //如果参数默认都为初始值的话,可能不会执行update
	param := make(map[string]interface{}, 0)
	param["status"] = status
	if status == 2 {
		//dailyBill.SettledAt = timeNow
		param["settled_at"] = timeNow
	}
	r = tx.Model(&model.DailyBill{}).Where(" user_id in (?) and bill_at = ? ", userIds, billAt).Update(param)
	if r.Error != nil {
		common.Logger.Warningln(r.Error.Error())
		tx.Rollback()
		return 0, r.Error
	}

	tx.Commit()
	return int(r.RowsAffected), nil
}

func (self *DailyBillService) UpdateStatusByUserIdAndStatus(oldStatus int, newStatus int, userIds ...int) (int, error) {
	var r *gorm.DB
	tx := common.SodaMngDB_WR.Begin()
	r = tx.Model(&model.DailyBill{}).Where("status = ? and user_id in (?)", oldStatus, userIds).Update("status", newStatus)
	if r.Error != nil {
		tx.Rollback()
		return 0, r.Error
	}
	tx.Commit()
	return int(r.RowsAffected), nil
}

func (self *DailyBillService) Recharge() (*[]*muniu.Recharge, error) {
	list := []*muniu.Recharge{}
	sql := `
	select date_format(date,'%Y-%m-%d') as  month,total_recharge_user as count
	from daily_operate
	where date>'2016-01-01'
	`
	rows, err := common.SodaMngDB_R.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		recharge := &muniu.Recharge{}
		common.SodaMngDB_R.ScanRows(rows, recharge)
		list = append(list, recharge)
	}
	return &list, nil
}

func (self *DailyBillService) Consume() (*[]*muniu.Consume, error) {
	list := []*muniu.Consume{}
	sql := `
	select date_format(date,'%Y-%m-%d') as  month,total_consume_user as count
	from daily_operate
	where date>'2016-01-01'
	`
	rows, err := common.SodaMngDB_R.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		consume := &muniu.Consume{}
		common.SodaMngDB_R.ScanRows(rows, consume)
		list = append(list, consume)
	}
	return &list, nil
}

/**
每日账单总额，按天统计
*/
func (self *DailyBillService) SumByDate(userIds ...string) (*[]*muniu.BillSumByDate, error) {
	list := []*muniu.BillSumByDate{}
	IdStr := ""
	start := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
	end := time.Now().Format("2006-01-02")
	sql := `
	select date_format(bill_at,'%Y-%m-%d') as date,(sum(total_amount)/100) as amount
	from daily_bill
	where
	bill_at >= ?
	and
	bill_at< ?
	`
	if len(userIds) > 0 {
		IdStr = strings.Join(userIds, ",")
		sql += `and user_id in (` + IdStr + `)`
	}
	sql += `
	and user_id!=0
	and account_type>0
	group by bill_at
	order by created_at desc
	`
	rows, err := common.SodaMngDB_R.Raw(sql, start, end).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		sumByDate := &muniu.BillSumByDate{}
		common.SodaMngDB_R.ScanRows(rows, sumByDate)
		list = append(list, sumByDate)
	}
	return &list, nil
}

/**
最近7天，微信充值金额，不含当天
*/
func (self *DailyBillService) WechatBillByDate() (*[]*muniu.BillSumByDate, error) {
	list := []*muniu.BillSumByDate{}
	start := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
	end := time.Now().Format("2006-01-02")
	sql := `select date_format(date,'%Y-%m-%d') as 'date',(sum(total_wechat_recharge)/100) as 'amount'
		from daily_operate
		where date >=?
		and date<?
		group by date_format(date,'%Y-%m-%d')
		order by created_timestamp desc
		`
	rows, err := common.SodaMngDB_R.Raw(sql, start, end).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		sumByDate := &muniu.BillSumByDate{}
		common.SodaMngDB_R.ScanRows(rows, sumByDate)
		list = append(list, sumByDate)
	}
	return &list, nil
}

/**
最近7天，支付宝充值金额，不含当天
*/
func (self *DailyBillService) AlipayBillByDate() (*[]*muniu.BillSumByDate, error) {
	list := []*muniu.BillSumByDate{}
	start := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
	end := time.Now().Format("2006-01-02")
	sql := `select date_format(date,'%Y-%m-%d') as 'date',(sum(total_alipay_recharge)/100) as 'amount'
		from daily_operate
		where date >=?
		and date<?
		group by date_format(date,'%Y-%m-%d')
		order by created_timestamp desc
		`
	rows, err := common.SodaMngDB_R.Raw(sql, start, end).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		sumByDate := &muniu.BillSumByDate{}
		common.SodaMngDB_R.ScanRows(rows, sumByDate)
		list = append(list, sumByDate)
	}
	return &list, nil
}

func (self *DailyBillService) BasicMapByBillAtAndUserId(billAt string, userIds interface{}) (map[int]*model.DailyBill, error) {
	list := &[]*model.DailyBill{}
	billMap := make(map[int]*model.DailyBill)
	r := common.SodaMngDB_R.Where("bill_at = ? and user_id in (?)", billAt, userIds).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, bill := range *list {
		billMap[bill.UserId] = bill
	}
	return billMap, nil
}

func (self *DailyBillService) Mark(id int) (bool, error) {
	dailyBill, err := self.Basic(id)
	if err != nil {
		return false, err
	}
	userId := dailyBill.UserId
	hasMarked := 0
	if dailyBill.HasMarked == 0 {
		hasMarked = 1
	} else {
		hasMarked = 0
	}
	data := map[string]interface{}{
		"has_marked": hasMarked,
	}
	r := common.SodaMngDB_WR.Model(&model.DailyBill{}).Where("user_id = ?", userId).Updates(data)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil

}

func (self *DailyBillService) DailyBillByAccountType(accountType int) (*[]*muniu.BillSumByDate, error) {
	_accountType := strconv.Itoa(accountType)
	list := []*muniu.BillSumByDate{}
	start := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
	end := time.Now().Format("2006-01-02")
	sql := "select sum(total_amount) as amount, bill_at as `date` " +
		" from `daily_bill` " +
		" where `user_id` !=1 and `account_type` =" + _accountType + " " +
		" and `bill_at` >='" + start + "' and bill_at<'" + end + "' group by bill_at"
	rows, err := common.SodaMngDB_R.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		sumByDate := &muniu.BillSumByDate{}
		common.SodaMngDB_R.ScanRows(rows, sumByDate)
		sumByDate.Amount = sumByDate.Amount / 100
		d, _ := time.Parse(time.RFC3339, sumByDate.Date)
		sumByDate.Date = d.Format("2006-01-02")
		list = append(list, sumByDate)
	}
	return &list, nil
}

func (self *DailyBillService) Permission(s string, signinUserId int) ([]string, int, int, error) {
	userRoleRelService := &UserRoleRelService{}
	var status []string
	var _status []string
	userId := -1
	if s != "" {
		_status = strings.Split(s, ",") //结算状态和提现状态
	}
	userRoleRel, err := userRoleRelService.BasicByUserId(signinUserId)
	roleId := userRoleRel.RoleId
	if err != nil {
		return nil, -1, -1, err
	}
	if len(_status) <= 0 {
		switch roleId {
		case 1:
			status = _status
			break
		case 3:
			status = append(status, []string{"1", "2", "3", "4"}...)
			break
		default:
			userId = signinUserId
			break
		}
	} else {
		for _, s := range _status {
			switch roleId {
			case 1:
				status = append(status, s)
				break
			case 3:
				if s == "1" || s == "2" || s == "3" || s == "4" {
					//1:银行已申请的账单, 2:银行和支付宝已结账的订单, 3:支付宝结账中的订单, 4:支付宝结算失败的订单
					status = append(status, s)
				}
				break
			default:
				status = append(status, s)
				userId = signinUserId
				break
			}
		}
	}
	if roleId == 3 && len(status) <= 0 {
		status = append(status, []string{"1", "2", "3", "4"}...)
	}
	return status, userId, roleId, nil
}
