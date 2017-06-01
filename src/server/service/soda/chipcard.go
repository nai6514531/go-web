package sodaService

import (
	"maizuo.com/soda-manager/src/server/model/soda"
	"maizuo.com/soda-manager/src/server/common"
	"github.com/jinzhu/gorm"
	"encoding/json"
	"maizuo.com/soda-manager/src/server/model"
)

type ChipcardService struct {

}
type Snapshot struct {
	Chipcard   soda.Chipcard
	CAccount   soda.Account
	ApplyUsers []model.User
	CBRels     []soda.CBRel
	Bill       soda.ChipcardBill
}

func (recv *ChipcardService) ListByMobile(userId int, mobile string, perPage int, page int) (*[]*soda.ChipcardRecharge, error) {
	var scopes []func(*gorm.DB) *gorm.DB
	list := []*soda.ChipcardRecharge{}
	if userId > 0 {
		scopes = append(scopes, func(db *gorm.DB) *gorm.DB {
			return db.Where("operator_id = ?", userId)
		})
	}
	if mobile != "" {
		scopes = append(scopes, func(db *gorm.DB) *gorm.DB {
			return db.Where("mobile = ?", mobile)
		})
	}
	if perPage > 0 && page > 0 {
		scopes = append(scopes, func(db *gorm.DB) *gorm.DB {
			return db.Limit(perPage).Offset((page - 1) * perPage)
		})
	}
	err := common.SodaDB_R.Scopes(scopes...).Find(&list).Error
	return &list, err
}

func (recv *ChipcardService) TotalByMobile(userId int, mobile string) (int, error) {
	var total int
	var scopes []func(*gorm.DB) *gorm.DB
	if userId > 0 {
		scopes = append(scopes, func(db *gorm.DB) *gorm.DB {
			return db.Where("operator_id = ?", userId)
		})
	}
	if mobile != "" {
		scopes = append(scopes, func(db *gorm.DB) *gorm.DB {
			return db.Where("mobile = ?", mobile)
		})
	}
	err := common.SodaDB_R.Table("chipcard_recharge").Scopes(scopes...).Count(&total).Error
	if err != nil {
		return 0, err
	}
	return total, nil
}

func (recv *ChipcardService) BasicByMobile(mobile string) (soda.Chipcard, error) {
	card := soda.Chipcard{}
	err := common.SodaDB_R.Where("mobile = ?", mobile).First(&card).Error
	if err != nil {
		return card, err
	}
	return card, nil
}

func (recv *ChipcardService) Recharge(recharge soda.ChipcardRecharge) (soda.ChipcardRecharge, error) {
	type IdNameP struct {
		Id 	int	`json:"id"`
		Name	string	`json:"name"`
	}
	tx := common.SodaDB_WR.Begin()
	var snapshot Snapshot
	json.Unmarshal([]byte(recharge.Snapshot), &snapshot)

	chipcard := snapshot.Chipcard
	cAccount := snapshot.CAccount
	applyUsers := snapshot.ApplyUsers
	if chipcard.Id <= 0 {
		//生成新的IC卡钱包
		chipcard.Mobile = recharge.Mobile
		chipcard.OperatorId = recharge.OperatorId
		chipcard.Value = recharge.Value
		chipcard.UserId = cAccount.UserId
		if err := tx.Create(&chipcard).Error; err != nil {
			tx.Rollback()
			return recharge, err
		}
	} else {
		//更改卡里余额
		chipcard.Value += recharge.Value
		if err := tx.Save(&chipcard).Error; err != nil {
			tx.Rollback()
			return recharge, err
		}
		//删除该C端账号关联的所有适用商家记录
		if err := tx.Where("user_id = ?", chipcard.UserId).Delete(&soda.CBRel{}).Error; err != nil {
			tx.Rollback()
			return recharge, err
		}
	}
	//重写适用商家表记录
	list := make([]soda.CBRel,len(applyUsers))
	simpleSnapshot := make([]IdNameP,len(applyUsers))
	for idx, user := range applyUsers {
		rel := soda.CBRel{
			ChipcardId:chipcard.Id,
			UserId:chipcard.UserId,
			BusinessUserId:user.Id,
		}

		if err := tx.Create(&rel).Error; err != nil {
			tx.Rollback()
			return recharge, err
		}
		list[idx] = rel
		idNameP := IdNameP{
			Id:user.Id,
			Name:user.Name,
		}
		simpleSnapshot[idx] = idNameP
	}
	snapshot.CBRels = list
	//生成交易流水
	bill := soda.ChipcardBill{
		Mobile:chipcard.Mobile,
		UserId:chipcard.UserId,
		ChipcardId:chipcard.Id,
		Title:"IC卡充值",
		Value:recharge.Value,
		Type:1,
		Action:1,
	}
	if err := tx.Create(&bill).Error; err != nil {
		tx.Rollback()
		return recharge, err
	}
	snapshot.Bill = bill
	{
		s,_ := json.Marshal(simpleSnapshot)
		//生成充值记录
		recharge.BillId = bill.BillId
		recharge.UserId = chipcard.UserId
		recharge.Snapshot = string(s)
		recharge.Count = 1
		recharge.Status = 7
		recharge.ChipcardId = chipcard.Id
		if err := tx.Create(&recharge).Error; err != nil {
			tx.Rollback()
			return recharge, err
		}
	}
	tx.Commit()
	return recharge, nil
}
