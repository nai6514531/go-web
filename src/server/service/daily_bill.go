package service

import (
	"github.com/jinzhu/gorm"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
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
	r := common.DB.Model(dailyBill).Count(&total)
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
		params = append(params, "%" + searchStr + "%")
		params = append(params, "%" + searchStr + "%")
		params = append(params, "%" + searchStr + "%")
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
		params = append(params, "%" + searchStr + "%")
		params = append(params, "%" + searchStr + "%")
		params = append(params, "%" + searchStr + "%")
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

func (self *DailyBillService) BasicMapByIds(id ...int) (map[int]*model.DailyBill, error) {
	list := &[]*model.DailyBill{}
	billMap := make(map[int]*model.DailyBill)
	r := common.DB.Where("id in (?)", id).Find(list)
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
	r := common.DB.Where("submit_at <= ? and status in (?)", submitAt, status).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DailyBillService) BasicByUserIdAndBillAt(userId int, billAt string) (*model.DailyBill, error) {
	dailyBill := &model.DailyBill{}
	r := common.DB.Where("user_id = ? and bill_at = ?", userId, billAt).First(dailyBill)
	if r.Error != nil {
		return nil, r.Error
	}
	return dailyBill, nil
}

func (self *DailyBillService) BasicMap(billAt string, status int, userIds ...string) (map[int]*model.DailyBill, error) {
	list := &[]*model.DailyBill{}
	dailyBillMap := make(map[int]*model.DailyBill)
	r := common.DB.Where("user_id in (?) and status = ? and bill_at = ?", userIds, status, billAt).Find(list)
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
	r := common.DB.Model(&model.DailyBill{}).Where(" id  = ? ", id).Update(dailyBill)
	if r.Error != nil {
		common.Logger.Debugln(r.Error.Error())
		return 0, r.Error
	}
	return int(r.RowsAffected), nil

}

func (self *DailyBillService) Updates(list *[]*model.DailyBill, mnznList interface{}) (int, error) {
	var r *gorm.DB
	var rows int
	var status int
	var userId int
	var billAt string
	var settledAt string
	rows = 0
	txmn := common.MNDB.Begin()
	if mnznList != nil {
		for _, _billMap := range mnznList.([]map[string]interface{}) {
			if _billMap["status"] != nil {
				status = _billMap["status"].(int)
			}
			if _billMap["userId"] != nil {
				userId = _billMap["userId"].(int)
			}
			if _billMap["billAt"] != nil {
				billAt = _billMap["billAt"].(string)
			}
			if _billMap["settledAt"] != nil {
				settledAt = _billMap["settledAt"].(string)
			}
			common.Logger.Warningln("_billMap===================", _billMap)
			mnParam := map[string]interface{}{
				"STATUS":   strconv.Itoa(status),
				"BILLDATE": settledAt,
			}
			common.Logger.Warningln("mnParam---------------------------", mnParam)
			r = txmn.Model(&muniu.BoxStatBill{}).Where(" COMPANYID = ? and PERIOD_START = ? AND STATUS != '2' ", userId, billAt).Updates(mnParam)
			if r.Error != nil {
				common.Logger.Warningln(r.Error.Error())
				txmn.Rollback()
				return 0, r.Error
			}
		}
	}

	tx := common.DB.Begin()
	for _, _bill := range *list {
		param := map[string]interface{}{
			"id": _bill.Id,
			"status":   _bill.Status,
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
	txmn.Commit()
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
	r := common.DB.Model(&model.DailyBill{}).Where(" id in (?) ", ids...).Update(param)
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
	mnUserIds := []string{}
	//update mnzn database
	//如果status本来为1,需要更新的也为1时,返回的受影响行数为0
	txmn := common.MNDB.Begin()
	statusStr := strconv.Itoa(status)
	boxStatBill := &muniu.BoxStatBill{Status: statusStr}
	timeNow := time.Now().Local().Format("2006-01-02 15:04:05")
	if status == 2 {
		boxStatBill.BillDate = timeNow
	}
	//mnzn用户id减1
	for _, _userId := range userIds {
		_mnUserId := functions.StringToInt(_userId) - 1
		//if (_mnUserId >= 0) {
		mnUserIds = append(mnUserIds, strconv.Itoa(_mnUserId))
		//}
	}
	r = txmn.Model(&muniu.BoxStatBill{}).Where(" COMPANYID in (?) and PERIOD_START = ? ", mnUserIds, billAt).Update(boxStatBill)
	if r.Error != nil {
		common.Logger.Warningln(r.Error.Error())
		txmn.Rollback()
		return 0, r.Error
	}
	common.Logger.Debugln("------------------------------------------------------")

	//update soda-manager
	//因为每次update时`updated_at`都会更新,所以基本上只要操作数据库成功返回受影响的行数都为1
	tx := common.DB.Begin()
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
		txmn.Rollback()
		return 0, r.Error
	}

	tx.Commit()
	txmn.Commit()
	return int(r.RowsAffected), nil
}

func (self *DailyBillService) UpdateStatusByUserIdAndStatus(oldStatus int, newStatus int, userIds ...int) (int, error) {
	var r *gorm.DB
	mnUserIds := []int{}
	txmn := common.MNDB.Begin()
	//mnzn用户id减1
	for _, _userId := range userIds {
		_mnUserId := _userId - 1
		mnUserIds = append(mnUserIds, _mnUserId)
	}
	r = txmn.Model(&muniu.BoxStatBill{}).Where("status = ? and COMPANYID in (?)", strconv.Itoa(oldStatus), mnUserIds).Update("Status", strconv.Itoa(newStatus))
	if r.Error != nil {
		txmn.Rollback()
		return 0, r.Error
	}

	tx := common.DB.Begin()
	r = tx.Model(&model.DailyBill{}).Where("status = ? and user_id in (?)", oldStatus, userIds).Update("status", newStatus)
	if r.Error != nil {
		tx.Rollback()
		return 0, r.Error
	}
	common.Logger.Debugln("update rows=========================", strconv.Itoa(int(r.RowsAffected)))

	tx.Commit()
	txmn.Commit()
	return int(r.RowsAffected), nil
}

func (self *DailyBillService) Recharge() (*[]*muniu.Recharge, error) {
	list := []*muniu.Recharge{}
	sql := "select DATE_FORMAT(UPDATETIME,'%Y-%m') as 'month',count(distinct usermobile) as 'count' " +
		" from trade_info " +
		" where date(UPDATETIME) >'2015-12' " +
		" and (tradestatus='success' or tradestatus='TRADE_SUCCESS') " +
		" group by DATE_FORMAT(UPDATETIME,'%Y-%m')"
	rows, err := common.MNREAD.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		recharge := &muniu.Recharge{}
		common.MNREAD.ScanRows(rows, recharge)
		list = append(list, recharge)
	}
	return &list, nil
}

func (self *DailyBillService) Consume() (*[]*muniu.Consume, error) {
	list := []*muniu.Consume{}
	sql := "select DATE_FORMAT(inserttime,'%Y-%m') as 'month',count(distinct usermobile) as 'count' " +
		" from box_wash " +
		" where companyid!=0 " +
		" group by DATE_FORMAT(inserttime,'%Y-%m')"
	rows, err := common.MNREAD.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		consume := &muniu.Consume{}
		common.MNREAD.ScanRows(rows, consume)
		list = append(list, consume)
	}
	return &list, nil
}

/**
每日账单总额，按天统计
*/
func (self *DailyBillService) SumByDate(companyIds ...string) (*[]*muniu.BillSumByDate, error) {
	list := []*muniu.BillSumByDate{}
	IdStr := ""
	start := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
	/*
	select bsb.PERIOD_START as 'date', sum(bsb.MONEY) as 'amount'  from box_stat_bill bsb, box_admin ba where
	bsb.PERIOD_START>='2016-11-29'  and bsb.PERIOD_START<'2016-12-06' and bsb.COMPANYID!=0 and ba.paytype!=-1
	and bsb.companyid=ba.localid group by bsb.PERIOD_START;
	*/
	end := time.Now().Format("2006-01-02")
	sql := " select bsb.PERIOD_START as 'date', sum(bsb.MONEY) as 'amount' " +
		" from box_stat_bill bsb, box_admin ba " +
		" where bsb.PERIOD_START>='" + start + "' " +
		" and bsb.PERIOD_START<'" + end + "'"
	if len(companyIds) > 0 {
		IdStr = strings.Join(companyIds, ",")
		sql += " and COMPANYID in (" + IdStr + ") "
	}
	sql +=  " and bsb.COMPANYID!=0 " +
		" and ba.paytype!=-1 and bsb.companyid=ba.localid " +
		" group by bsb.PERIOD_START"
	rows, err := common.MNREAD.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		common.Logger.Debugln("err:", err.Error())
		return nil, err
	}
	for rows.Next() {
		sumByDate := &muniu.BillSumByDate{}
		common.MNREAD.ScanRows(rows, sumByDate)
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
	sql := " select DATE_FORMAT(UPDATETIME,'%Y-%m-%d') as 'date',sum(price) as 'amount' " +
		" from trade_info " +
		" where date(UPDATETIME) >='" + start + "' " +
		" and date(UPDATETIME)<'" + end + "'" +
		" and tradestatus='success'" +
		" group by DATE_FORMAT(UPDATETIME,'%Y-%m-%d')"
	rows, err := common.MNREAD.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		sumByDate := &muniu.BillSumByDate{}
		common.MNREAD.ScanRows(rows, sumByDate)
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
	sql := " select DATE_FORMAT(UPDATETIME,'%Y-%m-%d') as 'date',sum(price) as 'amount' " +
		" from trade_info " +
		" where date(UPDATETIME) >='" + start + "'" +
		" and date(UPDATETIME)<'" + end + "'" +
		" and tradestatus='TRADE_SUCCESS' " +
		" group by DATE_FORMAT(UPDATETIME,'%Y-%m-%d')"
	rows, err := common.MNREAD.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		sumByDate := &muniu.BillSumByDate{}
		common.MNREAD.ScanRows(rows, sumByDate)
		list = append(list, sumByDate)
	}
	return &list, nil
}

func (self *DailyBillService) MnznBasicMapByType(payType ...string) (map[string]*muniu.BoxAdmin, error) {
	list := &[]*muniu.BoxAdmin{}
	accountMap := make(map[string]*muniu.BoxAdmin, 0)
	r := common.MNREAD.Where("paytype in (?)", payType).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, account := range *list {
		accountMap[strconv.Itoa(account.LocalId)] = account
	}
	return accountMap, nil
}

func (self *DailyBillService) BasicMapByBillAtAndUserId(billAt string, userIds interface{}) (map[int]*model.DailyBill, error) {
	list := &[]*model.DailyBill{}
	billMap := make(map[int]*model.DailyBill)
	r := common.DB.Where("bill_at = ? and user_id in (?)", billAt, userIds).Find(list)
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
	r := common.DB.Model(&model.DailyBill{}).Where("user_id = ?", userId).Updates(data)
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
	rows, err := common.DB.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		sumByDate := &muniu.BillSumByDate{}
		common.DB.ScanRows(rows, sumByDate)
		sumByDate.Amount = sumByDate.Amount / 100
		d,_:=time.Parse(time.RFC3339,sumByDate.Date)
		sumByDate.Date=d.Format("2006-01-02")
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
		_status = strings.Split(s, ",")  //结算状态和提现状态
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
