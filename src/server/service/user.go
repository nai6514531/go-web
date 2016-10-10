package service

import (
	"crypto/md5"
	"fmt"
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

func (self *UserService) Create(user *model.User) bool {
	//对明文密码md5
	user.Password = fmt.Sprintf("%x", md5.Sum([]byte(user.Password)))
	r := common.DB.Create(user)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
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
