package sodaService

import (
	"maizuo.com/soda-manager/src/server/model/soda"
	"maizuo.com/soda-manager/src/server/common"
	"github.com/jinzhu/gorm"
)

type ChipcardService struct {

}

func (recv *ChipcardService) Create(value int, mobile string, bUser int) {

}

func (recv *ChipcardService) ListByMobile(userId int, mobile string, perPage int, page int) (*[]*soda.ChipcardRecharge, error) {
	var scopes []func(*gorm.DB) *gorm.DB
	list := []*soda.ChipcardRecharge{}
	if userId > 0 {
		scopes = append(scopes, func(db *gorm.DB) *gorm.DB {
			return db.Where("user_id = ?", userId)
		})
	}
	if mobile != "" {
		scopes = append(scopes, func(db *gorm.DB) *gorm.DB {
			return db.Where("mobile = ?", mobile)
		})
	}
	if perPage > 0 && page > 0 {
		scopes = append(scopes, func(db *gorm.DB) *gorm.DB {
			return db.Limit(perPage).Offset((page-1)*perPage)
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
			return db.Where("user_id = ?", userId)
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
	err := common.SodaDB_R.Where("mobile = ?", mobile).Find(&card).Error
	if err != nil {
		return nil,err
	}
	return card,nil
}
