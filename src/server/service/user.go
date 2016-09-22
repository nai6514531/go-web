package service

import (
	"maizuo.com/smart-cinema/src/server/common"
	"maizuo.com/smart-cinema/src/server/model"
)

type UserService struct {
}

func (self *UserService) Basic(id int) (*model.User, error) {
	user := &model.User{}
	r := common.DB.Where("id = ?", id).First(user)
	if r.Error != nil {
		return nil, r.Error
	}
	return user, nil
}

func (self *UserService) BasicByThirdUserId(thirdUserId string) (*model.User, error) {
	user := &model.User{}
	r := common.DB.Where("third_user_id = ?", thirdUserId).First(user)
	if r.Error != nil {
		return nil, r.Error
	}
	return user, nil
}

func (self *UserService) Delete(id int) (bool, error) {
	user := &model.User{}
	r := common.DB.Where("id = ?", id).Delete(user)
	if r.Error != nil || r.RowsAffected < 0 {
		return false, r.Error
	}
	return true, nil
}

func (self *UserService) Create(user *model.User) (*model.User, error) {
	if user.ThirdUserId != "" {
		userService := &UserService{}
		if user, err := userService.BasicByThirdUserId(user.ThirdUserId); err == nil {
			return user, nil
		}
	}
	r := common.DB.Create(user)
	if r.Error != nil || r.RowsAffected < 0 {
		common.Logger.Warningln("注册新用户,插入记录失败:", r.Error.Error())
		return nil, r.Error
	}
	return user, nil;
}

func (self *UserService) Update(user *model.User) (bool, error) {
	common.DB.Model(&user).Update("nick_name", "change")
	return true, nil;
}
