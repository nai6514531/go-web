package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"maizuo.com/soda-manager/src/server/model"
	"strconv"
)

type MenuService struct {
}

//通过权限id列表列出菜单详情列表
func (self *MenuService) ListByPermissionIds(permissionIds []int) (*[]*model.Menu, error) {
	//关联查询菜单id
	permissionMenuRelList := &[]*model.PermissionMenuRel{}
	var menuIds []int
	r := common.SodaMngDB_R.Where("permission_id IN (?)", permissionIds).Find(permissionMenuRelList)
	if r.Error != nil {
		return nil, r.Error
	}
	for _, permissionMenuRel := range *permissionMenuRelList {
		menuIds = append(menuIds, permissionMenuRel.MenuId)
	}
	menuIdsUniq := functions.Uniq(menuIds) //数组去重
	//菜单id列表查详情
	menuList := &[]*model.Menu{}
	r = common.SodaMngDB_R.Where("id IN (?)", menuIdsUniq).Find(menuList)
	if r.Error != nil {
		return nil, r.Error
	}
	return menuList, nil
}

func (self *MenuService) ListByUserId(userId int) (*[]*model.Menu, error) {
	list := []*model.Menu{}
	_userId := strconv.Itoa(userId);
	sql := "select m.id,m.name,m.url  from menu m, role_permission_rel rpr,permission_menu_rel pmr " +
		"where rpr.role_id in (" +
		"select r.id from role r,user_role_rel urr where urr.user_id =" + _userId + " and r.id=urr.role_id" +
		") " +
		"and rpr.permission_id =pmr.permission_id and pmr.menu_id = m.id"
	rows, err := common.SodaMngDB_R.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		menu := &model.Menu{}
		common.SodaMngDB_R.ScanRows(rows, menu)
		list = append(list, menu)
	}
	return &list, nil
}
