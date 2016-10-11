package service

import (
	"errors"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type UserCashAccountService struct {
}

func (self *UserCashAccountService) Create(userCashAccount *model.UserCashAccount) bool {
	r := common.DB.Create(userCashAccount)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
}

func (self *UserCashAccountService) UpdateByUserId(userCashAccount *model.UserCashAccount) error {
	r := common.DB.Model(&model.UserCashAccount{}).Where("user_id = ?", userCashAccount.UserId).Updates(userCashAccount)
	if r.Error != nil {
		return r.Error
	}
	if r.RowsAffected <= 0 {
		return errors.New("用户id不存在")
	}
	return nil
}
