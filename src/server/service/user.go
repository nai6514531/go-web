package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type UserService struct {
}

//通过登陆名查找user表
func (self *UserService) FindByAccount(name string) (*model.User, error) {
	user := &model.User{}
	r := common.DB.Where("account = ?", name).First(user)
	if r.Error != nil {
		return nil, r.Error
	}
	return user, nil
}

func (self *UserService) Basic(id int) (*model.User, error) {
	user := &model.User{}
	r := common.DB.Where("id = ?", id).First(user)
	if r.Error != nil {
		return nil, r.Error
	}
	return user, nil
}

func (self *UserService) SubList(id int, page int, perPage int) (*[]*model.User, error) {
	list := &[]*model.User{}
	r := common.DB.Offset((page-1)*perPage).Limit(perPage).Where("parent_id = ?", id).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}
