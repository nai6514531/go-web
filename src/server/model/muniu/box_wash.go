package muniu

type BoxWash struct {
	LocalId    int `json:"local_id"  gorm:"column:LOCALID"`
	DeviceId   string `json:"device_id" gorm:"column:DEVICENO"`
	UserMobile string `json:"user_mobile" gorm:"column:USERMOBILE"`
	Password   string `json:"password" gorm:"column:PASSWD"`
	Price      float64 `json:"price" gorm:"column:PRICE"`
	Type       string `json:"type" gorm:"column:WASHTYPE"`
	InsertTime string `json:"insert_time" gorm:"column:INSERTTIME"`
	UserId     int `json:"user_id" gorm:"column:COMPANYID"`
	Status     int `json:"user_id" gorm:"column:STATUS"`
}

func (BoxWash) TableName() string {
	return "box_wash"
}
