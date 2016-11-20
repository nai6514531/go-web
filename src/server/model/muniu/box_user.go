package muniu

import "time"

type BoxUser struct {
	Mobile          string          `json:"mobile" gorm:"column:MOBILE"`
	PassWord        string          `json:"pass_word" gorm:"column:PASSWORD"`
	Recharge        float64         `json:"recharge" gorm:"column:RECHARGE"`
	Consumption     float64         `json:"consumption" gorm:"column:CONSUMPTION"`
	InsertTime      time.Time       `json:"insert_time" gorm:"column:INSERTTIME"`
	UpdateTime      time.Time       `json:"update_time" gorm:"column:UPDATETIME"`
	CompanyId       int             `json:"company_id" gorm:"column:COMPANYID"`
}

func (BoxUser) TableName() string {
	return "box_user"
}
