package model

type DeviceOperate struct {
	Model
	OperatorId   int    `json:"operatorId"`
	OperatorType int    `json:"operatorType"`
	SerialNumber string `json:"serialNumber"`
	UserId       int    `json:"userId"`
	FromUserId   int    `json:"fromUserId"`
	ToUserId     int    `json:"toUserId"`
}

func (DeviceOperate) TableName() string {
	return "device_operate"
}
