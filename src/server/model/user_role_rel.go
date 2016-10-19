package model

/**
  用户角色
*/
type UserRoleRel struct {
	Model
	UserId int `json:"userId"`
	RoleId int `json:"roleId"`
}

func (UserRoleRel) TableName() string {
	return "user_role_rel"
}
