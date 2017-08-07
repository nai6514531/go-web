package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"time"
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

func (self *BillService)Insert(userId int,userCashAccount *model.UserCashAccount)(int,error){
	user := &model.User{}
	// 获取到用户
	common.SodaMngDB_R.Where("id = ?",userId).First(user)

	dailyBillList := []*model.DailyBill{}
	// 获取到用户的日账单的信息
	r := common.SodaMngDB_R.Table("daily_bill").Where("user_id = ? and status = 0",userId).Scan(&dailyBillList)
	if r.Error != nil && r.Error != gorm.ErrRecordNotFound  {
		return -1,r.Error
	}
	if len(dailyBillList) == 0 {
		return -1,errors.New("用户不存在可提现订单")
	}
	tx := common.SodaMngDB_WR.Begin()
	totalAmount,count,cast,rate := 0,0,viper.GetInt("bill.cast"),viper.GetInt("bill.rate")
	billId := functions.GenerateIdByUserId(userId)
	for _,dailyBill := range dailyBillList {
		totalAmount += dailyBill.TotalAmount
		count += 1
		r = tx.Model(dailyBill).Updates(map[string]interface{}{"billId": billId, "status": 1})
		if r.Error != nil {
			tx.Rollback()
			return -1,r.Error
		}
	}

	if !(totalAmount < viper.GetInt("bill.borderValue") && userCashAccount.Type == 1) {
		// 如果不是支付宝而且大于200
		rate = rate
		cast = totalAmount*rate/100
	}
	amount := totalAmount - cast

	bill := model.Bill{
		BillId      :billId,
		Account     :userCashAccount.Account,
		AccountType :userCashAccount.Type,
		AccountName :userCashAccount.RealName,
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
	//common.SodaMngDB_R.Create(&bill)
	r = tx.Create(&bill)
	if r.Error != nil {
		tx.Rollback()
		return -1,errors.New("insert bill error")
	}

	tx.Commit()
	return bill.Id,nil
}

func (self *BillService)Update(id int,userId int,userCashAccount *model.UserCashAccount)(int ,error){
	bill := &model.Bill{}
	// 结账失败的单才可以重新发起结算
	r := common.SodaMngDB_R.Where("id = ? and status = 4",id).Find(bill)
	if r.Error != nil {
		return -1,r.Error
	}
	tx := common.SodaMngDB_R.Begin()
	// 更新账单状态
	r = tx.Model(bill).Updates(map[string]interface{}{
		"status":1,
		"account":userCashAccount.Account,
		"accountType" :userCashAccount.Type,
		"accountName" :userCashAccount.RealName,
	})
	if r.Error != nil {
		tx.Rollback()
		return -1,r.Error
	}
	// 获取到账单对应的日账单的信息
	dailyBillList := []*model.DailyBill{}
	r = common.SodaMngDB_R.Table("daily_bill").Where(" bill_id = ? ",bill.BillId).Scan(&dailyBillList)
	if r.Error != nil && r.Error != gorm.ErrRecordNotFound  {
		tx.Rollback()
		return -1,r.Error
	}
	if len(dailyBillList) == 0 {
		tx.Rollback()
		return -1,errors.New("账单号无对应日账单")
	}
	dailyBillAccountName := ""
	if userCashAccount.Type == 1{
		dailyBillAccountName = "支付宝"
	}else if userCashAccount.Type == 2 {
		dailyBillAccountName = "微信"
	}
	for _,dailyBill := range dailyBillList {
		r = tx.Model(dailyBill).Updates(map[string]interface{}{
			"status": 1,
			"account_type":userCashAccount.Type,
			"account_name":dailyBillAccountName,
			"account":userCashAccount.Account,
		})
		if r.Error != nil {
			tx.Rollback()
			return -1,r.Error
		}
	}

	tx.Commit()
	return id,nil
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
	if page == -1 {
		page = 1
	}
	if perPage == -1 {
		perPage = 10
	}
	sql += " and bill.user_id = ? "
	params = append(params,userId)
	// 排序规则：按申请时间先后排列，最新提交的提现申请排在最前面
	r := common.SodaMngDB_R.Raw(sql, params...).Order(" created_at desc ").Offset((page-1)*page).Limit(perPage).Scan(&billList)
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
	if page == -1 {
		page = 1
	}
	if perPage == -1 {
		perPage = 10
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
