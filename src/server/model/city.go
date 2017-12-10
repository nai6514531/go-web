package model

type City struct {
	ID           int    `json:"id,omitempty"`
	Name         string `json:"name,omitempty"`
	ParentID     int    `json:"parentId,omitempty"`
	ProvinceName string `json:"provinceName,omitempty" gorm:"-"`
	ProvinceID   int    `json:"provinceId,omitempty" gorm:"-"`
}

func (City) TableName() string {
	return "city"
}
