package model

type Device struct {
	Model
	UserId            int    `json:"userId"`
	UserName          string `json:"userName" gorm:"-"`
	UserMobile        string `json:"userMobile" gorm:"-"`
	FromUserId        int    `json:"fromUserId"`
	FromUserName      string `json:"fromUserName" gorm:"-"`
	FromUserMobile    string `json:"fromUserMobile" gorm:"-"`
	Label             string `json:"label"`
	SerialNumber      string `json:"serialNumber"`
	ReferenceDeviceId int    `json:"referenceDeviceId"`
	ProvinceId        int    `json:"provinceId"`
	CityId            int    `json:"cityId"`
	DistrictId        int    `json:"districtId"`
	SchoolId          int    `json:"schoolId"`
	SchoolName        string `json:"schoolName" gorm:"-"`
	Address           string `json:"address"`
	FirstPulsePrice   int    `json:"firstPulsePrice"`
	SecondPulsePrice  int    `json:"secondPulsePrice"`
	ThirdPulsePrice   int    `json:"thirdPulsePrice"`
	FourthPulsePrice  int    `json:"fourthPulsePrice"`
	FirstPulseName    string `json:"firstPulseName"`
	SecondPulseName   string `json:"secondPulseName"`
	ThirdPulseName    string `json:"thirdPulseName"`
	FourthPulseName   string `json:"fourthPulseName"`
	Password          string `json:"password"`
	Step              int    `json:"step"`
	HasAssigned       int    `json:"hasAssigned" gorm:"-"`
	AssignedAt        string `json:"assignedAt"`
	HasRetrofited     int    `json:"hasRetrofited"`
	Status            int    `json:"status"`
}

func (Device) TableName() string {
	return "device"
}
