package soda

import "maizuo.com/soda-manager/src/server/model"

type Wallet struct {
	model.Model
	UserId int   `json:"userId,omitempty"`
	Value int `json:"value,omitempty"`
	Mobile    string `json:"mobile,omitempty"`
	Status    int  `json:"status,omitempty"`
}

func (Wallet) TableName() string {
	return "wallet"
}
