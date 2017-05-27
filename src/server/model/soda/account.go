package soda

import "maizuo.com/soda-manager/src/server/model"

type Account struct {
	model.Model
	UserId int  `json:"userId,omitempty"`
	App    string `json:"app,omitempty"`
	Key    string `json:"key,omitempty"`
	Extra  string `json:"extra,omitempty"`
	Secret string `json:"secret,omitempty"`
	Mobile string `json:"mobile,omitempty"`
}

func (Account) TableName() string {
	return "account"
}
