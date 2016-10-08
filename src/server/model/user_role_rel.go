package model

/**
  用户角色
*/
type UserRoleRel struct {
	Model
	UserId int `json:"user_id"`
	RoleId int `json:"role_id"`
}

func (UserRoleRel) TableName() string {
	return "user_role_rel"
}
