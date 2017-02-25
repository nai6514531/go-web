package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type UserRoleRelService struct {
}

func (self *UserRoleRelService) Basic(id int) (*model.UserRoleRel, error) {
	userRoleRel := &model.UserRoleRel{}
	r := common.SodaMngDB_R.Where("id = ?", id).First(userRoleRel)
	if r.Error != nil {
		return nil, r.Error
	}
	return userRoleRel, nil
}

func (self *UserRoleRelService) BasicByUserId(userId int) (*model.UserRoleRel, error) {
	userRoleRel := &model.UserRoleRel{}
	r := common.SodaMngDB_R.Where("user_id = ? ", userId).First(userRoleRel)
	if r.Error != nil {
		return nil, r.Error
	}
	return userRoleRel, nil
}

func (self *UserRoleRelService) BasicByUserIdAndRoleId(userId int, roleId int) (*model.UserRoleRel, error) {
	userRoleRel := &model.UserRoleRel{}
	r := common.SodaMngDB_R.Where("user_id = ? and role_id=?", userId, roleId).First(userRoleRel)
	if r.Error != nil {
		return nil, r.Error
	}
	return userRoleRel, nil
}

func (self *UserRoleRelService) Create(userRoleRel *model.UserRoleRel) (bool,error) {
	r := common.SodaMngDB_WR.Create(userRoleRel)
	if r.Error != nil {
		return false,r.Error
	}
	return true,nil
}
