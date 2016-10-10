package service

import (
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
