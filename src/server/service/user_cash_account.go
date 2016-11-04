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

func (self *UserCashAccountService) Create(userCashAccount *model.UserCashAccount) bool {
	r := common.DB.Create(userCashAccount)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	//更新到木牛数据库
	//只有更新的为银行账号才更新木牛里面的账号其他支付宝和微信不同步进去
	if userCashAccount.Type == 3 {
		boxAdmin := &muniu.BoxAdmin{}
		boxAdmin.FillByUserCashAccount(userCashAccount)
		r = common.MNDB.Model(&muniu.BoxAdmin{}).Where("LOCALID = ?", boxAdmin.LocalId).Updates(boxAdmin)
		if r.RowsAffected <= 0 || r.Error != nil {
			return false
		}
	}
	return true
}

func (self *UserCashAccountService) UpdateByUserId(userCashAccount *model.UserCashAccount) bool {
	r := common.DB.Model(&model.UserCashAccount{}).Where("user_id = ?", userCashAccount.UserId).Updates(userCashAccount)
	if r.Error != nil || r.RowsAffected <= 0 {
		return false
	}
	//更新到木牛数据库
	//只有更新的为银行账号才更新木牛里面的账号其他支付宝和微信不同步进去
	if userCashAccount.Type == 3 {
		boxAdmin := &muniu.BoxAdmin{}
		boxAdmin.FillByUserCashAccount(userCashAccount)
		r = common.MNDB.Model(&muniu.BoxAdmin{}).Where("LOCALID = ?", boxAdmin.LocalId).Updates(boxAdmin)
		if r.Error != nil {
			return false
		}
	}
	return true
}

func (self *UserCashAccountService) ListByUserIds(userIds string) (*[]*model.UserCashAccount, error) {
	list := &[]*model.UserCashAccount{}
	r := common.DB.Model(&model.UserCashAccount{}).Where("user_id in (?)", userIds).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}
