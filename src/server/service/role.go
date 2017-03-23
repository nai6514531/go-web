package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"maizuo.com/soda-manager/src/server/model"
	"strconv"
)

type RoleService struct {
}

func (self *RoleService) BasicByUserId(userId int) (*model.Role, error) {
	_userId := strconv.Itoa(userId);
	sql := "select r.id,r.name  from role r,user_role_rel urr where urr.user_id =" + _userId + " and r.id=urr.role_id"
	rows, err := common.SodaMngDB_R.Raw(sql).Rows()
	role := &model.Role{}
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		common.SodaMngDB_R.ScanRows(rows, role)
	}
	return role, nil
}

//通过用户id查找角色id列表
func (self *RoleService) ListIdByUserId(userId int) ([]int, error) {
	var roleIDs []int
	//通过用户->角色查找
	userRoleRelList := &[]*model.UserRoleRel{}
	r := common.SodaMngDB_R.Where("user_id = ?", userId).Find(userRoleRelList)
	if r.Error != nil {
		return nil, r.Error
	}
	for _, userRoleRel := range *userRoleRelList {
		roleIDs = append(roleIDs, userRoleRel.RoleId)
	}
	//通过用户->组->角色查找
	groupRelList := &[]*model.UserGroupRel{}
	r = common.SodaMngDB_R.Where("user_id = ?", userId).Find(groupRelList) //找出user所属的所有组
	if r.Error != nil {
		return nil, r.Error
	}
	for _, groupRel := range *groupRelList {
		//对user的每一组找出对应的所有角色
		roleRelList := &[]*model.GroupRoleRel{}
		r = common.SodaMngDB_R.Where("group_id = ?", groupRel.GroupId).Find(roleRelList)
		if r.Error != nil {
			return nil, r.Error
		}
		//每一组对应的角色加到列表中
		for _, roleRel := range *roleRelList {
			roleIDs = append(roleIDs, roleRel.RoleId)
		}
	}
	ids := functions.Uniq(roleIDs) //数组去重
	return ids, nil
}

//通过角色id列表拉取角色详情列表
func (self *RoleService) ListByRoleIds(roleIDs []int) (*[]*model.Role, error) {
	roleList := &[]*model.Role{}
	r := common.SodaMngDB_R.Where("id IN (?)", roleIDs).Find(roleList) //找出user所属的所有组
	if r.Error != nil {
		return nil, r.Error
	}
	return roleList, nil
}
