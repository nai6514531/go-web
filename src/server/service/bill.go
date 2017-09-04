package service

import (
	"time"

	"github.com/go-errors/errors"
	"github.com/jinzhu/gorm"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"maizuo.com/soda-manager/src/server/model"
)

type BillService struct {
}

func (self *BillService) GetById(id int) (*model.Bill, error) {
	bill := &model.Bill{}
	r := common.SodaMngDB_R.Where("id = ?", id).First(bill)
	if r.Error != nil && r.Error == gorm.ErrRecordNotFound {
		return nil, r.Error
	}
	return bill, nil
}

func (self *BillService) BasicByBillId(billId string) (*model.Bill, error) {
	bill := &model.Bill{}
	r := common.SodaMngDB_R.Where(" bill_id = ? ", billId).Find(bill)
	if r.Error != nil {
		return nil, r.Error
	}
	return bill, r.Error
}

func (self *BillService) Withdraw(userId int, userCashAccount *model.UserCashAccount) (string, error) {
	user := &model.User{}
	// 获取到用户
	common.SodaMngDB_R.Where("id = ?", userId).First(user)

	dailyBillList := []*model.DailyBill{}
	// 获取到用户的日账单的信息
	r := common.SodaMngDB_R.Table("daily_bill").Where("user_id = ? and status = 0", userId).Scan(&dailyBillList)
	if r.Error != nil && r.Error != gorm.ErrRecordNotFound {
		return "", r.Error
	}
	if len(dailyBillList) == 0 {
		return "", errors.New("用户不存在可提现订单")
	}
	tx := common.SodaMngDB_WR.Begin()
	// 默认值cast为200,rate为0,即为支付宝少于200的情况
	totalAmount, count, cast, rate := 0, 0, viper.GetInt("bill.aliPay.cast"), viper.GetInt("bill.aliPay.rate")
	billId := functions.GenerateIdByUserId(userId)
	accountName := ""

	var dailyBillIds []int

	for _, dailyBill := range dailyBillList {
		dailyBillIds = append(dailyBillIds, dailyBill.Id)
		totalAmount += dailyBill.TotalAmount
	}

	if totalAmount < viper.GetInt("bill.min") {
		return "", errors.New("提现金额不可少于2元")
	}

	dailyBillIds = functions.Uniq(dailyBillIds)

	count = len(dailyBillList)

	if userCashAccount.Type == 1 {
		// 支付宝大于200的情况
		if totalAmount > viper.GetInt("bill.aliPay.borderValue") {
			rate = 1
			cast = int(functions.Round(float64(totalAmount * rate)/100.00,0))//四舍五入
		}
		accountName = "支付宝"
	} else if userCashAccount.Type == 2 {
		rate = viper.GetInt("bill.wechat.rate")
		cast = int(functions.Round(float64(totalAmount * rate)/100.00,0))//四舍五入
		accountName = "微信"
	} else {
		return "", errors.New("不支持的提现方式，请检查提现账单设置")
	}
	// 做一次四舍五入的操作,因为是分作单位,所以不需要保留分之后的小数位,所以n=0
	amount := totalAmount - cast
	status := 1
	bill := model.Bill{
		BillId:           billId,
		Account:          userCashAccount.Account,
		AccountType:      userCashAccount.Type,
		AccountName:      accountName,
		UserId:           userCashAccount.UserId,
		UserName:         user.Name,
		UserAccount:      user.Account,
		TotalAmount:      totalAmount,
		Count:            count,
		Rate:             rate,   // 费率
		Cast:             cast,   // 手续费
		Amount:           amount, // 真正收入的钱
		Mobile:           user.Mobile,
		RealName:         userCashAccount.RealName,
		Status:           status,
		Mode:             1,
		CreatedTimestamp: time.Now().Local().Unix(),
	}
	r = tx.Create(&bill)
	if r.Error != nil {
		tx.Rollback()
		return "", r.Error
	}

	updateData := map[string]interface{}{
		"bill_id":      billId,
		"status":       status,
		"account_type": userCashAccount.Type,
		"account_name": accountName,
		"account":      userCashAccount.Account,
		"real_name":    userCashAccount.RealName,
	}

	r = tx.Model(&model.DailyBill{}).Where("id in (?)", dailyBillIds).Where("status = 0 and bill_id = ''").Updates(updateData)

	if r.Error != nil {
		tx.Rollback()
		return "", r.Error
	}

	tx.Commit()
	return bill.BillId, nil
}

func (self *BillService) ReWithDraw(billId string, userId int, userCashAccount *model.UserCashAccount) error {
	bill := &model.Bill{}
	// 结账失败的单才可以重新发起结算
	r := common.SodaMngDB_R.Where("bill_id = ? and status = 4", billId).Find(bill)
	if r.Error != nil {
		return r.Error
	}
	if bill.TotalAmount < 200 {
		return errors.New("提现金额不可少于2元")
	}
	accountName := ""
	cast, rate := viper.GetInt("bill.aliPay.cast"), viper.GetInt("bill.aliPay.rate")
	if userCashAccount.Type == 1 {
		accountName = "支付宝"
		// 支付宝大于200的情况
		if bill.TotalAmount > viper.GetInt("bill.aliPay.borderValue") {
			rate = 1
			cast = int(functions.Round(float64(bill.TotalAmount * rate)/100.00,0))//四舍五入
		}
	} else if userCashAccount.Type == 2 {
		accountName = "微信"
		rate = viper.GetInt("bill.wechat.rate")
		cast = int(functions.Round(float64(bill.TotalAmount * rate)/100.00,0))//四舍五入
	} else {
		return errors.New("不支持的提现方式，请检查提现账单设置")
	}

	// 做一次四舍五入的操作,因为是分作单位,所以不需要保留分之后的小数位,所以n=0
	amount := bill.TotalAmount - cast

	status := 1

	tx := common.SodaMngDB_WR.Begin()
	// 更新账单状态
	r = tx.Model(&model.Bill{}).Where("bill_id = ?", billId).Updates(map[string]interface{}{
		"status":       status,
		"account":      userCashAccount.Account,
		"account_type": userCashAccount.Type,
		"account_name": accountName,
		"real_name":    userCashAccount.RealName,
		"cast":         cast,
		"rate":         rate,
		"amount":       amount,
	})

	if r.Error != nil {
		tx.Rollback()
		return r.Error
	}

	r = tx.Model(&model.DailyBill{}).Where("bill_id = ?", billId).Updates(map[string]interface{}{
		"status":       status,
		"account_type": userCashAccount.Type,
		"account_name": accountName,
		"account":      userCashAccount.Account,
		"real_name":    userCashAccount.RealName,
	})
	if r.Error != nil {
		tx.Rollback()
		return r.Error
	}

	tx.Commit()
	return nil
}

func (self *BillService) List(page int, perPage int, status int, startAt string, endAt string, userId int) ([]*model.Bill, error) {
	billList := []*model.Bill{}
	params := []interface{}{}
	sql := "select * from bill where ( bill.deleted_at IS NULL "
	if status > 0 {
		sql += " and bill.status = ? "
		params = append(params, status)
	}
	if startAt != "" {
		sql += " and Date(bill.created_at) >= ? "
		params = append(params, startAt)
	}
	if endAt != "" {
		sql += " and Date(bill.created_at) <= ? "
		params = append(params, endAt)
	}
	sql += " and bill.user_id = ? "
	params = append(params, userId)
	// 排序规则：按申请时间先后排列，最新提交的提现申请排在最前面
	r := common.SodaMngDB_R.Raw(sql, params...).Order(" id desc ").Offset((page - 1) * perPage).Limit(perPage).Scan(&billList)
	if r.Error != nil {
		return nil, r.Error
	}
	return billList, nil
}

func (self *BillService) Total(page int, perPage int, status int, startAt string, endAt string, userId int) (int, error) {
	type Result struct {
		Total int
	}
	params := []interface{}{}
	result := &Result{}
	sql := "select count(*) as total from bill where bill.deleted_at IS NULL "
	if status > 0 {
		sql += " and bill.status = ? "
		params = append(params, status)
	}
	if startAt != "" {
		sql += " and Date(bill.created_at) >= ? "
		params = append(params, startAt)
	}
	if endAt != "" {
		sql += " and Date(bill.created_at) <= ? "
		params = append(params, endAt)
	}
	sql += " and bill.user_id = ? "
	params = append(params, userId)
	common.Logger.Debugln(params)
	r := common.SodaMngDB_R.Raw(sql, params...).Scan(result)
	if r.Error != nil {
		return -1, r.Error
	}
	return result.Total, nil
}
