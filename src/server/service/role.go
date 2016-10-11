package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"maizuo.com/soda-manager/src/server/model"
)

type RoleService struct {
}

//通过用户id查找角色id列表
func (self *RoleService) ListIdByUserId(userId int) ([]int, error) {
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
	ids := functions.IntDuplicate(roleIDs) //数组去重
	return ids, nil
}
