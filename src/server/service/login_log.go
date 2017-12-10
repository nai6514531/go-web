package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type LoginLogService struct {
}

func (self *LoginLogService) Create(loginLog *model.LoginLog) (bool, error) {
	err := common.SodaMngDB_WR.Create(loginLog).Error
	if err != nil {
		return false, err
	}
	return true, nil
}
