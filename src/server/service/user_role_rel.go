package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type UserRoleRelService struct {
}

func (self *UserRoleRelService) Basic(id int) (*model.UserRoleRel, error) {
	userRoleRel := &model.UserRoleRel{}
	r := common.DB.Where("id = ?", id).First(userRoleRel)
	if r.Error != nil {
		return nil, r.Error
	}
	return userRoleRel, nil
}

func (self *UserRoleRelService) BasicByUserIdAndRoleId(userId int, roleId int) (*model.UserRoleRel, error) {
	userRoleRel := &model.UserRoleRel{}
	r := common.DB.Where("user_id = ? and role_id=?", userId, roleId).First(userRoleRel)
	if r.Error != nil {
		return nil, r.Error
	}
	return userRoleRel, nil
}
