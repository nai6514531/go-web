package model

/**
  省城区信息
*/
type Region struct {
	Model
	Name      string `json:"name"`       //省城区名
	ParentId  int    `json:"parent_id"`  //父id
	Code      string `json:"code"`       //省城区码
	Level     int    `json:"level"`      //级别标识 1:省 2: 市 3:区
	LevelName string `json:"level_name"` //级别名
}

func (Region) TableName() string {
	return "region"
}
