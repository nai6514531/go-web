package model

/**
  角色-组信息
*/
type GroupRoleRel struct {
	Model
	RoleId  int `json:"role_id"`
	GroupId int `json:"group_id"`
}

func (GroupRoleRel) TableName() string {
	return "group_role_rel"
}
