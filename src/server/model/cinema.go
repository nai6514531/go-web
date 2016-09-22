package model

/**
  影院信息
*/
type Cinema struct {
	Model
	Name            string      `json:"name"`              //影院名
	ProvinceId      int         `json:"province_id"`       //省id
	CityId          int         `json:"city_id"`           //城市id
	DistrictId      int         `json:"district_id"`       //区域id
	CinemaCircuitId int         `json:"cinema_circuit_id"` //院线id,独立影院默认为0
	Province        interface{} `json:"province,omitempty"`
	City            interface{} `json:"city,omitempty"`
	District        interface{} `json:"district,omitempty"`
	CinemaCircuit   interface{} `json:"cinemaCircuit,omitempty"`
	Address         string      `json:"address"` //影院地址
	Phone           string      `json:"phone"`   //影院电话
	Logo            string      `json:"logo"`    //影院logo
	Status          int         `json:"status"`  //状态 0:在线 1:下线
}

func (Cinema) TableName() string {
	return "cinema"
}
