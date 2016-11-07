package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"strconv"
	"github.com/jinzhu/gorm"
	"maizuo.com/soda-manager/src/server/model/muniu"
	"time"
	"maizuo.com/soda-manager/src/server/kit/functions"
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

func (self *DailyBillService) TotalByAccountType(cashAccounType int, status []string, billAt string, userId int) (int, error) {
	type Result struct {
		Total int
	}
	result := &Result{}
	params := make([]interface{}, 0)
	sql := "select count(*) as total from  daily_bill bill,cash_account_type cat,user_cash_account uca where " +
		"bill.user_id=uca.user_id and uca.type=cat.id and bill.deleted_at IS NULL"
	if userId != -1 {
		sql += " and bill.user_id = ? "
		params = append(params, userId)
	}
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

func (self *DailyBillService) ListWithAccountType(cashAccounType int, status []string, billAt string, userId int, page int, perPage int) (*[]*model.DailyBill, error) {
	list := []*model.DailyBill{}
	params := make([]interface{}, 0)
	_offset := strconv.Itoa((page - 1) * perPage)
	_perPage := strconv.Itoa(perPage)
	sql := "select bill.*, cat.id as account_type,cat.name as account_name from daily_bill bill,cash_account_type " +
		"cat,user_cash_account uca where bill.user_id=uca.user_id and uca.type=cat.id and bill.deleted_at IS NULL "
	if userId != -1 {
		sql += " and bill.user_id = ? "
		params = append(params, userId)
	}
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

	sql += " order by bill.id DESC limit " + _perPage + " offset " + _offset
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

func (self *DailyBillService) Updates(list *[]*model.DailyBill) (int, error) {
	tx := common.DB.Begin()
	var r *gorm.DB
	var rows int
	rows = 0
	for _, _bill := range *list {
		r = tx.Model(&model.DailyBill{}).Update(&_bill)
		if r.Error != nil {
			common.Logger.Debugln(r.Error.Error())
			tx.Rollback()
			return 0, r.Error
		} else {
			rows += int(r.RowsAffected)
		}

	}
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
		param["submit_at"] = timeNow
	}
	r := common.DB.Model(&model.DailyBill{}).Where(" id in (?) ", ids...).Update(param)
	if r.Error != nil {
		common.Logger.Debugln(r.Error.Error())
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
		if (_mnUserId >= 0) {
			mnUserIds = append(mnUserIds, strconv.Itoa(_mnUserId))
		}
	}
	r = txmn.Model(&muniu.BoxStatBill{}).Where(" COMPANYID in (?) and PERIOD_START = ? ", mnUserIds, billAt).Update(boxStatBill)
	if r.Error != nil {
		common.Logger.Debugln(r.Error.Error())
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
		common.Logger.Debugln(r.Error.Error())
		tx.Rollback()
		txmn.Rollback()
		return 0, r.Error
	}

	tx.Commit()
	txmn.Commit()
	common.Logger.Debugln("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
	return int(r.RowsAffected), nil
}

func (self *DailyBillService)UpdateStausByUserIdAndStatus(oldStatus int, newStatus int, userIds ...int) (int, error) {
	r := common.DB.Model(&model.DailyBill{}).Where("status = ? and user_id in (?)", oldStatus, userIds).Update("status", newStatus)
	if r.Error != nil {
		return 0, r.Error
	}
	common.Logger.Debugln("update rows=========================", strconv.Itoa(int(r.RowsAffected)))
	return int(r.RowsAffected), nil
}

func (self *DailyBillService) Recharge() (*[]*muniu.Recharge, error) {
	list := []*muniu.Recharge{}
	sql := "select DATE_FORMAT(UPDATETIME,'%Y-%m') as 'month',count(distinct usermobile) as 'count' " +
		"from trade_info " +
		"where date(UPDATETIME) >'2015-12' " +
		"and tradetype in ('7','8') " +
		"and tradeno!=''  " +
		"and (tradestatus='success' or tradestatus='TRADE_SUCCESS') " +
		"group by DATE_FORMAT(UPDATETIME,'%Y-%m')"
	rows, err := common.MNDBPROD.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		recharge := &muniu.Recharge{}
		common.MNDB.ScanRows(rows, recharge)
		list = append(list, recharge)
	}
	return &list, nil
}

func (self *DailyBillService) Consume() (*[]*muniu.Consume, error) {
	list := []*muniu.Consume{}
	sql := "select DATE_FORMAT(inserttime,'%Y-%m') as 'month',count(distinct usermobile) as 'count' " +
		"from box_wash where companyid!=0 group by DATE_FORMAT(inserttime,'%Y-%m')"
	rows, err := common.MNDBPROD.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		consume := &muniu.Consume{}
		common.MNDB.ScanRows(rows, consume)
		list = append(list, consume)
	}
	return &list, nil
}

/**
每日账单总额，按天统计
 */
func (self *DailyBillService) SumByDate() (*[]*muniu.BillSumByDate, error) {
	list := []*muniu.BillSumByDate{}
	start := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
	end := time.Now().Format("2006-01-02")
	sql := " select PERIOD_START as 'date', sum(MONEY) as 'count' " +
		" from box_stat_bill " +
		" where PERIOD_START>='" + start + "' " +
		" and PERIOD_START<'" + end + "'" +
		" and COMPANYID!=0 " +
		" group by PERIOD_START"
	rows, err := common.MNDBPROD.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		sumByDate := &muniu.BillSumByDate{}
		common.MNDB.ScanRows(rows, sumByDate)
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
	sql := " select DATE_FORMAT(UPDATETIME,'%Y-%m-%d') as 'date',sum(price) as 'count' " +
		" from trade_info " +
		" where date(UPDATETIME) >='" + start + "' " +
		" and date(UPDATETIME)<'" + end + "'" +
		" and tradestatus='success'" +
		" group by DATE_FORMAT(UPDATETIME,'%Y-%m-%d')"
	rows, err := common.MNDBPROD.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		sumByDate := &muniu.BillSumByDate{}
		common.MNDB.ScanRows(rows, sumByDate)
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
	sql := " select DATE_FORMAT(UPDATETIME,'%Y-%m-%d') as 'date',sum(price) as 'count' " +
		" from trade_info " +
		" where date(UPDATETIME) >='" + start + "'" +
		" and date(UPDATETIME)<'" + end + "'" +
		" and tradestatus='TRADE_SUCCESS' " +
		" group by DATE_FORMAT(UPDATETIME,'%Y-%m-%d')"
	rows, err := common.MNDBPROD.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		sumByDate := &muniu.BillSumByDate{}
		common.MNDB.ScanRows(rows, sumByDate)
		list = append(list, sumByDate)
	}
	return &list, nil
}
