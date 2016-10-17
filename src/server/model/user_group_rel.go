package model

/**
  用户-组信息
*/
type UserGroupRel struct {
	Model
	UserId  int `json:"userId"`
	GroupId int `json:"groupId"`
}

func (UserGroupRel) TableName() string {
	return "user_group_rel"
}
