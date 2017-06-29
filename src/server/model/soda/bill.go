package soda

import (
	"maizuo.com/soda-manager/src/server/model"
	"github.com/jinzhu/gorm"
	"time"
	"maizuo.com/soda-manager/src/server/kit/functions"
)

type Bill struct {
	model.Model
	BillID           string        `json:"bill_id"`
	Mobile           string        `json:"mobile"`
	UserID           int        `json:"user_id"`
	WalletID         int        `json:"wallet_id"`
	Title            string        `json:"title"`
	Value            int        `json:"value"`
	Type             int        `json:"type"`
	Action           int        `json:"action"`
	Status           int        `json:"status"`
	CreatedTimestamp int        `json:"created_timestamp,omitempty"`
}

func (self *Bill) BeforeCreate(scope *gorm.Scope) error {
	now := time.Now().Local()
	at := now.Format("2006-01-02 15:04:05")
	scope.SetColumn("created_at", at)
	scope.SetColumn("updated_at", at)
	scope.SetColumn("created_timestamp", now.Unix())
	scope.SetColumn("bill_id", functions.GenerateIdByMobile(self.Mobile))
	return nil
}

func (Bill) TableName() string {
	return "bill"
}
