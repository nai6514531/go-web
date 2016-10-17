package model

type Region struct {
	Model
	Name      string `json:"name"`
	ParentId  int    `json:"parentId"`
	Code      string `json:"code"`
	Level     int    `json:"level"`
	LevelName string `json:"levelName"`
}

func (Region) TableName() string {
	return "region"
}
