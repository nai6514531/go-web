package model

type Device struct {
	Model
	UserId            int    `json:"user_id"`
	Label             string `json:"label"`
	SerialNumber      string `json:"serial_number"`
	ReferenceDeviceId int    `json:"reference_device_id"`
	ProvinceId        int    `json:"province_id"`
	CityId            int    `json:"city_id"`
	DistrictId        int    `json:"district_id"`
	SchoolId          int    `json:"school_id"`
	Address           string `json:"address"`
	FirstPulsePrice   int    `json:"first_pulse_price"`
	SecondPulsePrice  int    `json:"second_pulse_price"`
	ThirdPulsePrice   int    `json:"third_pulse_price"`
	ForthPulsePrice   int    `json:"forth_pulse_price"`
	FirstPulseName    string `json:"first_pulse_name"`
	SecondPulseName   string `json:"second_pulse_name"`
	ThirdPulseName    string `json:"third_pulse_name"`
	ForthPulseName    string `json:"forth_pulse_name"`
	Status            int    `json:"status"`
}


func (Device) TableName() string {
	return "device"
}
