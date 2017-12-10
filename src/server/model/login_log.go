package model

import (
	"time"

	"github.com/jinzhu/gorm"
	"maizuo.com/soda/erp/api/src/server/constant"
)

type LoginLog struct {
	ID                int       `json:"id,omitempty"`
	UserId            int       `json:"userId,omitempty"`
	UserName          string    `json:"userName,omitempty"`
	UserAccount       string    `json:"userAccount,omitempty"`
	ProvinceId        int       `json:"provinceId,omitempty"`
	ProvinceName      string    `json:"provinceName,omitempty"`
	CityId            int       `json:"cityId,omitempty"`
	CityName          string    `json:"cityName,omitempty"`
	Created_timestamp int       `json:"created_Timestamp,omitempty"`
	CreatedAt         time.Time `json:"createdAt,omitempty"`
	UpdatedAt         time.Time `json:"updatedAt,omitempty"`
}

func (self *LoginLog) BeforeCreate(scope *gorm.Scope) error {
	now := time.Now().Local()
	at := now.Format(constant.SIMPLE_TIME)
	scope.SetColumn("created_at", at)
	scope.SetColumn("updated_at", at)
	scope.SetColumn("created_Timestamp", now.Unix())
	return nil
}

func (LoginLog) TableName() string {
	return "login_log"
}
