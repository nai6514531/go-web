package model

/**
  角色权限
*/
type RolePermissionRel struct {
	Model
	PermissionId int `json:"permissionId"`
	RoleId       int `json:"roleId"`
}

func (RolePermissionRel) TableName() string {
	return "role_permission_rel"
}
