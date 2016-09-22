package model

/**
  影厅信息
*/
type Hall struct {
	Model
	Name         string `json:"name"`      //厅名
	CinemaId     int    `json:"cinema_id"` //影院id
	Status       int    `json:"status"`    //状态 0:在线 1:下线
	Schedule     interface{} `json:"schedule,omitempty" gorm:"-"`
	NewCount     int    `json:"new_count,omitempty" gorm:"-"`
	NoPrintCount int    `json:"noprint_count,omitempty" gorm:"-"`
	PrintedCount int    `json:"printed_count,omitempty" gorm:"-"`
}

func (Hall) TableName() string {
	return "hall"
}
