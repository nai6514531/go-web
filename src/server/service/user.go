package service

import (
	"crypto/md5"
	"errors"
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

//通过手机号码查找user表
func (self *UserService) FindByMobile(mobile string) (*model.User, error) {
	user := &model.User{}
	r := common.DB.Where("mobile = ?", mobile).First(user)
	if r.Error != nil {
		return nil, r.Error
	}
	return user, nil
}

func (self *UserService) TotalByParentId(parentId int) (int, error) {
	user := &model.User{}
	var total int64
	r := common.DB.Model(user).Where("parent_id = ?", parentId).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return int(total), nil
}

func (self *UserService) TotalOfDevice(userId int) (int, error) {
	device := &model.Device{}
	var total int
	r := common.DB.Model(device).Where("user_id = ?", userId).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return total, nil
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

func (self *UserService) Update(user *model.User) error {
	r := common.DB.Model(&model.User{}).Where("id = ?", user.Id).Updates(user)
	//先判断err因为err不为空的时候，RowsAffected也一定小于等于0
	if r.Error != nil { //唯一索引等错误
		return r.Error
	}
	if r.RowsAffected <= 0 { //以id找不到东西
		return errors.New("用户id不存在")
	}
	return nil
}

func (self *UserService) Basic(id int) (*model.User, error) {
	user := &model.User{}
	r := common.DB.Where("id = ?", id).First(user)
	if r.Error != nil {
		return nil, r.Error
	}
	return user, nil
}

func (self *UserService) SubList(parentId int, page int, perPage int) (*[]*model.User, error) {
	list := &[]*model.User{}
	r := common.DB.Offset((page-1)*perPage).Limit(perPage).Where("parent_id = ?", parentId).Order("id desc").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

//根据父用户id列出所有子用户ids
func (self *UserService) ChildIdsByUserId(parentId int) ([]int, error) {
	var childIds []int
	list := &[]*model.User{}
	r := common.DB.Where("parent_id = ? AND id != ?", parentId, parentId).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	if r.RowsAffected <= 0 { //没有找到
		return nil, nil
	}
	for _, v := range *list {
		childIds = append(childIds, v.Id)
	}
	return childIds, nil
}

//根据父用户递归列出所有（子子子。。）用户ids
func (self *UserService) SubChildIdsByUserId(parentId int) ([]int, error) {
	var childIds []int
	ids, _ := self.ChildIdsByUserId(parentId)
	if ids == nil { //没有找到
		return nil, nil
	} else {
		childIds = append(childIds, ids...)
		for _, v := range ids {
			ids, _ := self.SubChildIdsByUserId(v)
			if ids != nil {
				childIds = append(childIds, ids...)
			}
		}
		return childIds, nil
	}
}

//根据父id算出有几个子用户
func (self *UserService) CountByParentId(parentId int) (int64, error) {
	list := &[]*model.User{}
	r := common.DB.Where("parent_id = ?", parentId).Find(list)
	if r.Error != nil {
		return 0, r.Error
	}
	if r.RowsAffected <= 0 {
		return 0, nil
	}
	return r.RowsAffected, nil
}
