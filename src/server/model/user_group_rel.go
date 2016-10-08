package model

/**
  用户-组信息
*/
type UserGroupRel struct {
	Model
	UserId  int `json:"user_id"`
	GroupId int `json:"group_id"`
}

func (UserGroupRel) TableName() string {
	return "user_group_rel"
}
