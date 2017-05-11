package export

import (
	"os"
	"time"

	"github.com/spf13/viper"
	"github.com/tealeg/xlsx"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"github.com/jinzhu/gorm"
)

//每日账单导出
type DailyBillExport struct {
	Id           int
	UserName     string
	TotalAmount  int
	BillAt       string
	Status       int //1.未申请提现or未结账 1:已申请提现 2:已结账 3:结账中 4:结账失败
	OrderCount   int
	AccountName  string
	Account      string
	RealName     string
	BankName     string
	HeadBankName string
	Province     string
	City         string
}

func (self *DailyBillExport) Excel(cashAccountType int, status []string, userId int, searchStr string, roleId int, startAt string, endAt string) (string, error) {
	list := []*DailyBillExport{}
	var scopes []func(*gorm.DB) *gorm.DB
	var row *xlsx.Row
	type values []interface{}
	//sql := "select count(*) as total from  daily_bill bill,cash_account_type cat,user_cash_account uca where " +
	//	"bill.user_id=uca.user_id and uca.type=cat.id and bill.deleted_at IS NULL"
	//sql := "select * from daily_bill bill where bill.deleted_at IS NULL "
	//rows, err := common.SodaMngDB_R.Raw(sql, params...).
	//	Joins("left join user_cash_account on bill.user_id = user_cash_account.user_id").
	//	Joins("left join region on region.id = user_cash_account.province_id").Rows()

	if userId != -1 {
		scopes = append(scopes, func(db *gorm.DB)*gorm.DB {return db.Where("bill.user_id = ?", userId)})
	}

	if cashAccountType > 0 {
		scopes = append(scopes, func(db *gorm.DB)*gorm.DB {return db.Where("bill.account_type = ?", cashAccountType)})
	}
	if len(status) > 0 {
		scopes = append(scopes, func(db *gorm.DB)*gorm.DB {return db.Where("bill.status in (?)", status)})
	}
	if searchStr != "" {
		scopes = append(scopes, func(db *gorm.DB)*gorm.DB {return db.Where("bill.bank_name like ? or bill.user_name like ? or bill.real_name like ?", "%"+searchStr+"%", "%"+searchStr+"%", "%"+searchStr+"%")})
	}
	if roleId == 3 {//财务角色过滤掉测试账号的账单
		scopes = append(scopes, func(db *gorm.DB)*gorm.DB {return db.Where("bill.user_id != ?", 1)})
	}
	if startAt != "" {
		scopes = append(scopes, func(db *gorm.DB)*gorm.DB {return db.Where("bill.bill_at >= ?", startAt)})
	}
	if startAt != "" && endAt != "" {
		scopes = append(scopes, func(db *gorm.DB)*gorm.DB {return db.Where("bill.bill_at <= ?", endAt)})
	}
	rows, err := common.SodaMngDB_R.Table("daily_bill bill").
		Select("bill.id,bill.user_name,bill.account_name,bill_at,order_count,status,bill.account,bill.real_name,bill.bank_name,p.name as province,c.name as city,total_amount,cash.head_bank_name").
		Joins("left join user_cash_account cash on bill.user_id = cash.user_id").
		Joins("left join region c on c.id = cash.city_id").
		Joins("left join region p on p.id = cash.province_id").Scopes(scopes...).Rows()

	//common.Logger.Debugln(cashAccountType, status, userId, searchStr, roleId, startAt, endAt)
	defer rows.Close()
	if err != nil {
		return "", err
	}

	//将查询的数据装填
	root, _ := os.Getwd()
	path := root + viper.GetString("export.loadsPath")
	_, err = functions.CreatePathIfNotExists(path)
	if err != nil {
		return "", err
	}
	name := time.Now().Format("20060102150405") + ".xlsx"
	url := path + "/" + name
	common.Logger.Debug("url========", url)
	file := xlsx.NewFile()
	sheet, err := file.AddSheet("结算管理列表")
	if err != nil {
		return "", err
	}
	s := values{"账单号", "运营商", "收款方式", "账期", "订单量", "状态", "收款人账号", "收款人姓名", "收方开户支行", "收款人所在省", "收款人所在市", "金额", "收方开户银行"}
	row = sheet.AddRow()
	row.WriteSlice(&s, -1)
	for rows.Next() {
		singleReco := &DailyBillExport{}
		common.SodaMngDB_R.ScanRows(rows, singleReco)
		list = append(list, singleReco)
	}
	for _, _bill := range list {
		statusStr := ""
		row = sheet.AddRow()
		switch _bill.Status {
		case 0:
			statusStr = "未结账"
		case 1:
			if roleId == 3 {
				statusStr = "未结账"
			} else {
				statusStr = "已申请结账"
			}
		case 2:
			statusStr = "已结账"
		case 3:
			statusStr = "结账中"
		case 4:
			statusStr = "结账失败"
		}
		_time, err := time.Parse(time.RFC3339, _bill.BillAt)
		if err != nil {
			common.Logger.Warning("soda-manager导出结算列表时间转换失败：", err.Error())
		}
		_timeStr := _time.Format("2006-01-02")
		s := values{_bill.Id, _bill.UserName, _bill.AccountName, _timeStr, _bill.OrderCount, statusStr, _bill.Account, _bill.RealName, _bill.BankName, _bill.Province, _bill.City, float64(_bill.TotalAmount) / 100, _bill.HeadBankName}
		row.WriteSlice(&s, -1)
	}
	err = file.Save(url)
	if err != nil {
		return "", err
	}
	return name, nil
}
