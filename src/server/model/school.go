package model

type School struct {
	Model
	Name       string `json:"name"`
	ProvinceId int    `json:"-"`
}

func (School) TableName() string {
	return "school"
}
