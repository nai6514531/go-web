package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"maizuo.com/soda-manager/src/server/model"
)

type PermissionService struct {
}

//根据role的id列表列出拥有的权限id列表
func (self *PermissionService) ListIdsByRoleIds(roleIds []int) ([]int, error) {
	theStructList := &[]*model.RolePermissionRel{}
	var permissionIds []int
	r := common.SodaMngDB_R.Where("role_id IN (?)", roleIds).Find(theStructList)
	if r.Error != nil {
		return nil, r.Error
	}
	for _, theStruct := range *theStructList {
		permissionIds = append(permissionIds, theStruct.PermissionId)
	}
	ids := functions.Uniq(permissionIds) //数组去重
	return ids, nil
}

//根据权限id列出详情
func (self *PermissionService) ListByIds(permissionIds []int) (*[]*model.Permission, error) {
	permissionList := &[]*model.Permission{}
	r := common.SodaMngDB_R.Where("id IN (?)", permissionIds).Find(permissionList)
	if r.Error != nil {
		return nil, r.Error
	}
	return permissionList, nil
}

func (self *PermissionService) ChipcardOper(userId int) (bool) {
	c := 0
	err := common.SodaMngDB_R.Table("chipcard_operator").Where("id = ?", userId).Count(&c).Error
	return err == nil && c > 0
}
