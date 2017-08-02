package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"time"
	"github.com/jinzhu/gorm"
	"github.com/go-errors/errors"
	"fmt"
	"math/rand"
)

type BillService struct {

}

func (self *BillService)Insert(userId int,userCashAccount *model.UserCashAccount)(int,error){
	tx := common.SodaMngDB_WR.Begin()
	user := &model.User{}
	// 获取到用户
	common.SodaMngDB_R.Where("id = ?",userId).First(user)

	dailyBillList := []*model.DailyBill{}
	// 获取到用户的日账单的信息
	r := common.SodaMngDB_R.Table("daily_bill").Where("user_id = ? and status = 0",userId).Scan(&dailyBillList)
	if r.Error != nil && r.Error != gorm.ErrRecordNotFound {
		return -1,r.Error
	}
	totalAmount,count,cast,rate := 0,0,2,0
	for _,dailyBill := range dailyBillList {
		totalAmount += dailyBill.TotalAmount
		count += 1
	}
	billId := fmt.Sprintf("%v%04d%06v\n",
		time.Now().Local().Format("060102"), 2454,
		rand.New(rand.NewSource(time.Now().UnixNano())).Intn(654321))
	if !(totalAmount > 200 && userCashAccount.Type == 1) {
		// 如果不是支付宝而且大于200
		cast = totalAmount*1/100
		rate = 1
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
		SettledAt   :time.Now(),
		TotalAmount :totalAmount,
		Count       :count,
		Rate        :rate,//TODO 费率
		Cast        :cast,//TODO 手续费
		Amount      :amount,//TODO 真正收入的钱
		Mobile      :user.Mobile,
		RealName    :userCashAccount.RealName,
		Status      :1,
	}
	//common.SodaMngDB_R.Create(&bill)
	isTure := tx.NewRecord(&bill)
	if !isTure {
		tx.Rollback()
		return -1,errors.New("insert bill error")
	}
	tx.Commit()
	return -1,nil
}

//func (self *BillService)Update(billId int,userId)(int error){
//
//}
