package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/toolfunc/slicetool"
)

type PermissionService struct {
}

//根据role的id列表列出拥有的权限id列表
func (self *PermissionService) ListIdsByRoleIds(roleIds []int) ([]int, error) {
	theStructList := &[]*model.RolePermissionRel{}
	var permissionIds []int
	r := common.DB.Where("role_id IN (?)", roleIds).Find(theStructList)
	if r.Error != nil {
		return nil, r.Error
	}
	for _, theStruct := range *theStructList {
		permissionIds = append(permissionIds, theStruct.PermissionId)
	}
	ids := slicetool.IntDuplicate(permissionIds) //数组去重
	return ids, nil
}

//根据权限id列出详情
func (self *PermissionService) ListByIds(permissionIds []int) (*[]*model.Permission, error) {
	permissionList := &[]*model.Permission{}
	r := common.DB.Where("id IN (?)", permissionIds).Find(permissionList)
	if r.Error != nil {
		return nil, r.Error
	}
	return permissionList, nil
}
