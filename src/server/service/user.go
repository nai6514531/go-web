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

//通过用户id查找角色id列表
func (self *UserService) ListRoleByUser(userId int) ([]int, error) {
	var roleIDs []int
	//通过用户->角色查找
	userRoleRelList := &[]*model.UserRoleRel{}
	r := common.DB.Where("user_id = ?", userId).Find(userRoleRelList)
	if r.Error != nil {
		return nil, r.Error
	}
	for _, userRoleRel := range *userRoleRelList {
		roleIDs = append(roleIDs, userRoleRel.RoleId)
	}
	//通过用户->组->角色查找
	groupRelList := &[]*model.UserGroupRel{}
	r = common.DB.Where("user_id = ?", userId).Find(groupRelList) //找出user所属的所有组
	if r.Error != nil {
		return nil, r.Error
	}
	for _, groupRel := range *groupRelList { //对user的每一组找出对应的所有角色
		roleRelList := &[]*model.GroupRoleRel{}
		r = common.DB.Where("group_id = ?", groupRel.GroupId).Find(roleRelList)
		if r.Error != nil {
			return nil, r.Error
		}
		//每一组对应的角色加到列表中
		for _, roleRel := range *roleRelList {
			roleIDs = append(roleIDs, roleRel.RoleId)
		}
	}
	//对数组进行去重
	intInSlice := func(i int, list []int) bool {
		for _, v := range list {
			if v == i {
				return true
			}
		}
		return false
	}
	var roleIDsDuplicate []int
	for _, roleId := range roleIDs {
		if !intInSlice(roleId, roleIDsDuplicate) {
			roleIDsDuplicate = append(roleIDsDuplicate, roleId)
		}
	}
	return roleIDsDuplicate, nil
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
