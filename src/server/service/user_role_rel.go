package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/model/muniu"
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

func (self *UserRoleRelService) Create(userRoleRel *model.UserRoleRel) bool {
	r := common.DB.Create(userRoleRel)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	//更新到木牛数据库
	boxAdmin := &muniu.BoxAdmin{}
	boxAdmin.FillByUserRoleRel(userRoleRel)
	r = common.MNDB.Model(&muniu.BoxAdmin{}).Where("LOCALID = ?", boxAdmin.LocalId).Updates(boxAdmin)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
}
