package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/toolfunc/slicetool"
)

type MenuService struct {
}

//通过权限id列表列出菜单详情列表
func (self *MenuService) ListByPermissionIds(permissionIds []int) (*[]*model.Menu, error) {
	//关联查询菜单id
	permissionMenuRelList := &[]*model.PermissionMenuRel{}
	var menuIds []int
	r := common.DB.Where("permission_id IN (?)", permissionIds).Find(permissionMenuRelList)
	if r.Error != nil {
		return nil, r.Error
	}
	for _, permissionMenuRel := range *permissionMenuRelList {
		menuIds = append(menuIds, permissionMenuRel.MenuId)
	}
	menuIdsDuplicate := slicetool.IntDuplicate(permissionIds) //数组去重
	//菜单id列表查详情
	menuList := &[]*model.Menu{}
	r = common.DB.Where("id IN (?)", menuIdsDuplicate).Find(menuList)
	if r.Error != nil {
		return nil, r.Error
	}
	return menuList, nil
}
