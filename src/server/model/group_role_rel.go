package model

/**
  角色-组信息
*/
type GroupRoleRel struct {
	Model
	RoleId  int `json:"roleId"`
	GroupId int `json:"groupId"`
}

func (GroupRoleRel) TableName() string {
	return "group_role_rel"
}
