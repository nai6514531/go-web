package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"github.com/jinzhu/gorm"
	"github.com/go-errors/errors"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"github.com/spf13/viper"
)

type BillService struct {

}

func (self *BillService)GetById(id int)(*model.Bill,error){
	bill := &model.Bill{}
	r := common.SodaMngDB_R.Where("id = ?",id).First(bill)
	if r.Error != nil && r.Error == gorm.ErrRecordNotFound{
		return nil,r.Error
	}
	return bill,nil
}

func (self *BillService)BasicByBillId(billId string)(*model.Bill,error){
	bill := &model.Bill{}
	r := common.SodaMngDB_R.Where(" bill_id = ? ",billId).Find(bill)
	if r.Error != nil {
		return nil, r.Error
	}
	return bill, r.Error
}

func (self *BillService)Insert(userId int,userCashAccount *model.UserCashAccount)(string,error){
	user := &model.User{}
	// 获取到用户
	common.SodaMngDB_R.Where("id = ?",userId).First(user)

	dailyBillList := []*model.DailyBill{}
	// 获取到用户的日账单的信息
	r := common.SodaMngDB_R.Table("daily_bill").Where("user_id = ? and status = 0",userId).Scan(&dailyBillList)
	if r.Error != nil && r.Error != gorm.ErrRecordNotFound  {
		return "",r.Error
	}
	if len(dailyBillList) == 0 {
		return "",errors.New("用户不存在可提现订单")
	}
	tx := common.SodaMngDB_WR.Begin()
	// 默认值cast为200,rate为0,即为支付宝少于200的情况
	totalAmount,count,cast,rate := 0,0,viper.GetInt("bill.aliPay.cast"),viper.GetInt("bill.aliPay.rate")
	billId := functions.GenerateIdByUserId(userId)
	accountName := ""
	if userCashAccount.Type == 1 {
		accountName = "支付宝"
	}else if userCashAccount.Type == 2 {
		accountName = "微信"
	}else if userCashAccount.Type == 3 {
		accountName = "银行"
	}
	for _,dailyBill := range dailyBillList {
		totalAmount += dailyBill.TotalAmount
		count += 1
		r = tx.Model(dailyBill).Updates(map[string]interface{}{
			"billId": billId,
			"status": 1,
			"account_type":userCashAccount.Type,
			"account_name":accountName,
			"account":userCashAccount.Account,
			"real_name":userCashAccount.RealName,
		})
		if r.Error != nil {
			tx.Rollback()
			return "",r.Error
		}
	}
	if userCashAccount.Type == 1 {
		// 支付宝大于200的情况
		if totalAmount > viper.GetInt("bill.aliPay.borderValue") {
			rate = 1
			cast = totalAmount * rate / 100
		}
	} else {
		rate = viper.GetInt("bill.wechat.rate")
		cast = totalAmount * rate / 100
	}
	amount := totalAmount - cast
	if amount < 200 {
		tx.Rollback()
		return "",errors.New("提现金额不可少于2元")
	}

	bill := model.Bill{
		BillId      :billId,
		Account     :userCashAccount.Account,
		AccountType :userCashAccount.Type,
		AccountName :accountName,
		UserId      :userCashAccount.UserId,
		UserName    :user.Name,
		UserAccount :user.Account,
		TotalAmount :totalAmount,
		Count       :count,
		Rate        :rate,// 费率
		Cast        :cast,// 手续费
		Amount      :amount,// 真正收入的钱
		Mobile      :user.Mobile,
		RealName    :userCashAccount.RealName,
		Status      :1,
	}
	r = tx.Create(&bill)
	if r.Error != nil {
		tx.Rollback()
		return "",errors.New("insert bill error")
	}

	tx.Commit()
	return bill.BillId,nil
}

func (self *BillService)Update(billId string,userId int,userCashAccount *model.UserCashAccount)(error){
	bill := &model.Bill{}
	// 结账失败的单才可以重新发起结算
	r := common.SodaMngDB_R.Where("bill_id = ? and status = 4",billId).Find(bill)
	if r.Error != nil {
		return r.Error
	}
	accountName := ""
	if userCashAccount.Type == 1{
		accountName = "支付宝"
	}else if userCashAccount.Type == 2 {
		accountName = "微信"
	}
	tx := common.SodaMngDB_R.Begin()
	// 更新账单状态
	r = tx.Model(bill).Updates(map[string]interface{}{
		"status":1,
		"account":userCashAccount.Account,
		"account_type" :userCashAccount.Type,
		"account_ame" :accountName,
		"real_name":userCashAccount.RealName,
	})
	if r.Error != nil {
		tx.Rollback()
		return r.Error
	}
	// 获取到账单对应的日账单的信息
	dailyBillList := []*model.DailyBill{}
	r = common.SodaMngDB_R.Table("daily_bill").Where(" bill_id = ? ",bill.BillId).Scan(&dailyBillList)
	if r.Error != nil && r.Error != gorm.ErrRecordNotFound  {
		tx.Rollback()
		return r.Error
	}
	if len(dailyBillList) == 0 {
		tx.Rollback()
		return errors.New("账单号无对应日账单")
	}

	for _,dailyBill := range dailyBillList {
		r = tx.Model(dailyBill).Updates(map[string]interface{}{
			"status":       1,
			"account_type": userCashAccount.Type,
			"account_name": accountName,
			"account":      userCashAccount.Account,
			"real_name":userCashAccount.RealName,
		})
		if r.Error != nil {
			tx.Rollback()
			return r.Error
		}
	}

	tx.Commit()
	return nil
}

func  (self *BillService)List(page int,perPage int,status int,createdAt string,userId int) ([]*model.Bill,error) {
	billList := []*model.Bill{}
	params := []interface{}{}
	sql := "select * from bill where ( bill.deleted_at IS NULL "
	if status > 0 {
		sql += " and bill.status = ? "
		params = append(params, status)
	}
	if createdAt != "" {
		sql += " and Date(bill.created_at) = ? "
		params = append(params, createdAt)
	}
	sql += " and bill.user_id = ? "
	params = append(params,userId)
	// 排序规则：按申请时间先后排列，最新提交的提现申请排在最前面
	r := common.SodaMngDB_R.Raw(sql, params...).Order(" created_at desc ").Offset((page-1)*perPage).Limit(perPage).Scan(&billList)
	if r.Error != nil {
		return nil,r.Error
	}
	return billList,nil
}

func (self *BillService)Total(page int,perPage int,status int,createdAt string,userId int) (int,error){
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
	if createdAt != "" {
		sql += " and Date(bill.created_at) = ? "
		params = append(params, createdAt)
	}
	sql += " and bill.user_id = ? "
	params = append(params,userId)
	common.Logger.Debugln(params)
	r := common.SodaMngDB_R.Raw(sql, params...).Scan(result)
	if r.Error != nil {
		return -1,r.Error
	}
	return result.Total,nil
}
