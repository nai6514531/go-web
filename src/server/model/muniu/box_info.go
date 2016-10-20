package muniu

import (
	"maizuo.com/soda-manager/src/server/model"
	"strconv"
)

type BoxInfo struct {
	DeviceNo   string  `json:"device_no" gorm:"column:DEVICENO"`
	CompanyId  int     `json:"company_id" gorm:"column:COMPANYID"`
	Status     string  `json:"status" gorm:"column:STATUS"`
	Password   string  `json:"password" gorm:"column:PASSWORD"`
	Location   int     `json:"location" gorm:"column:LOCATION"`
	InsertTime string  `json:"insert_time" gorm:"column:INSERTTIME"`
	UpdateTime string  `json:"update_time" gorm:"column:UPDATETIME"`
	Address    string  `json:"address" gorm:"column:ADDRESS"`
	Price_601  float64 `json:"price_601" gorm:"column:PRICE_601"`
	Price_602  float64 `json:"price_602" gorm:"column:PRICE_602"`
	Price_603  float64 `json:"price_603" gorm:"column:PRICE_603"`
	Price_604  float64 `json:"price_604" gorm:"column:PRICE_604"`
	DeviceType string  `json:"device_type" gorm:"column:DEVICETYPE"`
}

func (BoxInfo) TableName() string {
	return "box_info"
}

func (self *BoxInfo) FillByDevice(device *model.Device) {
	self.CompanyId = device.UserId
	self.Password = device.Password
	self.Location = device.Step
	self.DeviceNo = device.SerialNumber
	self.DeviceType = strconv.Itoa(device.ReferenceDeviceId - 1)
	self.Address = device.Address
	self.Price_601 = float64(device.FirstPulsePrice) / 100
	self.Price_602 = float64(device.SecondPulsePrice) / 100
	self.Price_603 = float64(device.ThirdPulsePrice) / 100
	self.Price_604 = float64(device.FourthPulsePrice) / 100
	self.Status = strconv.Itoa(device.Status)
	self.InsertTime = device.CreatedAt.Format("2006-01-02 15:04:05")
	self.UpdateTime = device.UpdatedAt.Format("2006-01-02 15:04:05")
}
