package soda

import "maizuo.com/soda-manager/src/server/model"

type User struct {
	model.Model
	NickName  string `json:"nickName,omitempty"`
	AvatorUrl string `json:"avatorUrl,omitempty"`
	Mobile    string `json:"mobile,omitempty"`
	Gender    int32  `json:"gender,omitempty"`
}

func (User) TableName() string {
	return "user"
}
