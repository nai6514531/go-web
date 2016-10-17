package model

type PermissionMenuRel struct {
	Model
	PermissionId int `json:"permissionId"`
	MenuId       int `json:"menuId"`
	Status       int `json:"status"`
}

func (PermissionMenuRel) TableName() string {
	return "permission_menu_rel"
}
