package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type UserCasHAccountService struct {
}

func (self *UserCasHAccountService) Basic(id int) (*model.UserCashAccount, error) {
	userCashAccount := &model.UserCashAccount{}
	r := common.DB.Where("id = ?", id).First(userCashAccount)
	if r.Error != nil {
		return nil, r.Error
	}
	return userCashAccount, nil
}

func (self *UserCasHAccountService) BasicByUserId(userId int) (*model.UserCashAccount, error) {
	userCashAccount := &model.UserCashAccount{}
	r := common.DB.Where("user_id = ?", userId).First(userCashAccount)
	if r.Error != nil {
		return nil, r.Error
	}
	return userCashAccount, nil
}
