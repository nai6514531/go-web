package model

type School struct {
	Model
	Name        string `json:"name"`
	ProvinceId  int    `json:"-"`
	DeviceTotal int    `json:"deviceTotal,omitempty" gorm:"-"`
}

func (School) TableName() string {
	return "school"
}
