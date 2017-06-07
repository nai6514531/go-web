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
	err := common.SodaDB_R.Scopes(scopes...).Order("created_at desc").Find(&list).Error
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
	nothing := []*soda.ChipcardRecharge{}        //在gorm中，只会对绑定了模型的操作进行软删除排查，相当于在SQL中加上"deleted_at= null"的查询条件
	err := common.SodaDB_R.Scopes(scopes...).Find(&nothing).Count(&total).Error
	if err != nil {
		return 0, err
	}
	return total, nil
}

func (recv *ChipcardService) BasicByMobile(mobile string) (soda.Chipcard, error) {
	card := soda.Chipcard{}
	list := make([]model.User, 0)
	CBRelList := make([]soda.CBRel, 0)
	busiIdList := make([]int, 0)
	err := common.SodaDB_R.Where("mobile = ?", mobile).First(&card).Error
	if err != nil {
		return card, err
	}
	err = common.SodaDB_R.Where("chipcard_id = ?", card.Id).Find(&CBRelList).Error
	if err != nil {
		return card, err
	}
	for _, rel := range CBRelList {
		busiIdList = append(busiIdList, rel.BusinessUserId)
	}
	if len(busiIdList) != 0 {
		err = common.SodaMngDB_R.Where("id in (?)", busiIdList).Find(&list).Error
		if err != nil {
			return card, err
		}
		card.ApplyProviders = list
	}
	return card, nil
}

func (recv *ChipcardService) Recharge(recharge soda.ChipcardRecharge) (soda.ChipcardRecharge, error) {
	type IdNameP struct {
		Id   int        `json:"id"`
		Name string        `json:"name"`
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
	list := make([]soda.CBRel, len(applyUsers))
	simpleSnapshot := make([]IdNameP, len(applyUsers))
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
		s, _ := json.Marshal(simpleSnapshot)
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

func (recv *ChipcardService) ChangeRel(id int, applyUsers []model.User) (soda.Chipcard, error) {
	chipcard := soda.Chipcard{}
	err := common.SodaDB_R.First(&chipcard, id).Error
	if err != nil {
		return chipcard, err
	}
	tx := common.SodaDB_WR.Begin()

	if err := tx.Where("user_id = ?", chipcard.UserId).Delete(&soda.CBRel{}).Error; err != nil {
		tx.Rollback()
		return chipcard, err
	}
	for _, user := range applyUsers {
		rel := soda.CBRel{
			ChipcardId:chipcard.Id,
			UserId:chipcard.UserId,
			BusinessUserId:user.Id,
		}

		if err := tx.Create(&rel).Error; err != nil {
			tx.Rollback()
			return chipcard, err
		}
	}
	tx.Commit()
	chipcard.ApplyProviders = applyUsers
	return chipcard, nil
}
