package model

type Province struct {
	ID   int    `json:"id,omitempty"`
	Name string `json:"name,omitempty"`
}

func (Province) TableName() string {
	return "province"
}
