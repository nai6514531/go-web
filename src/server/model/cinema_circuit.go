package model

/**
  院线信息
*/
type CinemaCirCuit struct {
	Model
	Name   string `json:"name"`   //院线名
	Logo   string `json:"logo"`   //院线logo
	Status int    `json:"status"` //状态 0:在线 1:下线
}

func (CinemaCirCuit) TableName() string {
	return "cinema_circuit"
}
