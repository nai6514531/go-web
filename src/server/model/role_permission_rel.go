package model

/**
  角色权限
*/
type RolePermissionRel struct {
	Model
	PermissionId int `json:"permission_id"`
	RoleId       int `json:"role_id"`
}

func (RolePermissionRel) TableName() string {
	return "role_permission_rel"
}
