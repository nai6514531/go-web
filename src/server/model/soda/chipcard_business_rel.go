package soda

import "maizuo.com/soda-manager/src/server/model"

type CBRel struct {
	model.Model
	ChipcardId     int        `json:"chipcard_id,omitempty"`
	BusinessUserId int        `json:"business_user_id,omitempty"`
	UserId         int        `json:"user_id,omitempty"`
	status         int        `json:"status"`
}

func (CBRel) TableName() string {
	return "chipcard_business_rel"
}
