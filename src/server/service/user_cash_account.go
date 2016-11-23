package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/model/muniu"
)

type UserCashAccountService struct {
}

func (self *UserCashAccountService) Basic(id int) (*model.UserCashAccount, error) {
	userCashAccount := &model.UserCashAccount{}
	r := common.DB.Where("id = ?", id).First(userCashAccount)
	if r.Error != nil {
		return nil, r.Error
	}
	return userCashAccount, nil
}

func (self *UserCashAccountService) BasicByUserId(userId int) (*model.UserCashAccount, error) {
	userCashAccount := &model.UserCashAccount{}
	r := common.DB.Where("user_id = ?", userId).First(userCashAccount)
	if r.Error != nil {
		return nil, r.Error
	}
	return userCashAccount, nil
}

func (self *UserCashAccountService) BasicMapByUserId(userIds interface{}) (map[int]*model.UserCashAccount, error) {
	list := &[]*model.UserCashAccount{}
	accountMap := make(map[int]*model.UserCashAccount)
	r := common.DB.Where("user_id in (?)", userIds).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, account := range *list {
		accountMap[account.UserId] = account
	}
	return accountMap, nil
}

func (self *UserCashAccountService) BasicMapByType(payType ...int) (map[string]*model.UserCashAccount, error) {
	list := &[]*model.UserCashAccount{}
	accountMap := make(map[string]*model.UserCashAccount, 0)
	r := common.DB.Where("type in (?)", payType).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, account := range *list {
		accountMap[account.RealName] = account
	}
	return accountMap, nil
}

func (self *UserCashAccountService) Create(userCashAccount *model.UserCashAccount) bool {
	transAction := common.DB.Begin()
	r := transAction.Create(userCashAccount)
	if r.RowsAffected <= 0 || r.Error != nil {
		transAction.Rollback()
		return false
	}
	//更新到木牛数据库
	boxAdmin := &muniu.BoxAdmin{}
	boxAdmin.FillByUserCashAccount(userCashAccount)
	r = common.MNDB.Model(&muniu.BoxAdmin{}).Where("LOCALID = ?", boxAdmin.LocalId).Updates(boxAdmin)
	if r.RowsAffected <= 0 || r.Error != nil {
		transAction.Rollback()
		return false
	}
	transAction.Commit()
	return true
}

func (self *UserCashAccountService) UpdateByUserId(userCashAccount *model.UserCashAccount) (bool, error) {
	transAction := common.DB.Begin()
	mnTransAction := common.MNDB.Begin()
	r := transAction.Model(&model.UserCashAccount{}).Where("user_id = ?", userCashAccount.UserId).Updates(userCashAccount)
	if r.Error != nil {
		transAction.Rollback()
		mnTransAction.Rollback()
		return false, r.Error
	}
	//对有可能为0的值进行单独更新
	var value_zero = make(map[string]interface{})
	value_zero["type"] = userCashAccount.Type
	value_zero["province_id"] = userCashAccount.ProvinceId
	value_zero["city_id"] = userCashAccount.CityId

	//再单独更新一次type避免为0时更新不了
	r = transAction.Model(&model.UserCashAccount{}).Where("user_id = ?", userCashAccount.UserId).Updates(value_zero)
	if r.Error != nil {
		transAction.Rollback()
		mnTransAction.Rollback()
		return false, r.Error
	}
	//更新到木牛数据库
	boxAdmin := &muniu.BoxAdmin{}
	boxAdmin.FillByUserCashAccount(userCashAccount)
	r = mnTransAction.Model(&muniu.BoxAdmin{}).Where("LOCALID = ?", boxAdmin.LocalId).Updates(boxAdmin)
	if r.Error != nil {
		transAction.Rollback()
		mnTransAction.Rollback()
		return false, r.Error
	}
	transAction.Commit()
	mnTransAction.Commit()
	return true, r.Error
}

func (self *UserCashAccountService) ListByUserIds(userIds string) (*[]*model.UserCashAccount, error) {
	list := &[]*model.UserCashAccount{}
	r := common.DB.Model(&model.UserCashAccount{}).Where("user_id in (?)", userIds).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *UserCashAccountService) List(payType ...int) (*[]*model.UserCashAccount, error) {
	list := &[]*model.UserCashAccount{}
	r := common.DB.Model(&model.UserCashAccount{}).Where("type in (?)", payType).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}
