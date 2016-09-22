package model

/**
  设备信息
*/
type Device struct {
	Model
	Name       string `json:"name"`        //设备名
	ProvinceId int    `json:"province_id"` //省份id
	CityId     int    `json:"city_id"`     //城市id
	DistrictId int    `json:"district_id"` //区域id
	CinemaId   int    `json:"cinema_id"`   //影院id
	HallId     int    `json:"hall_id"`     //厅id
	X          int    `json:"x"`           //坐标x
	Y          int    `json:"y"`           //坐标y
	RowName    string `json:"row_name"`    //坐标行名
	ColumnName string `json:"column_name"` //坐标列名
	Status     int    `json:"status"`      //状态 0:正常 1:损坏
}

func (Device) TableName() string {
	return "device"
}
