package model

type Region struct {
	Model
	Name      string `json:"name"`
	ParentId  int    `json:"parent_id"`
	Code      string `json:"code"`
	Level     int    `json:"level"`
	LevelName string `json:"level_name"`
}

func (Region) TableName() string {
	return "region"
}
