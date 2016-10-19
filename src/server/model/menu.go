package model

type Menu struct {
	Model
	Name     string `json:"name"`
	Url      string `json:"url"`
	ParentId int    `json:"parentId"`
	Level    int    `json:"level"`
	Status   int    `json:"status"`
}

func (Menu) TableName() string {
	return "menu"
}
