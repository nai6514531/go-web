package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type DeviceService struct {
}

/**
	获取设备基础信息
 */
func (self *DeviceService) Basic(id int) (*model.Device, error) {
	device := &model.Device{}
	r := common.DB.Where(" id = ? ", id).First(&device)
	if r.Error != nil {
		return nil, r.Error
	}
	return device, r.Error
}

/**
	获取设备基础信息列表
 */
func (self *DeviceService) BasicMap(ids []int) (map[int]interface{}, error) {
	list := &[]*model.Device{}
	deviceMap := make(map[int]interface{})

	r := common.DB.Where(" id IN (?)", ids).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, device := range *list {
		deviceMap[device.Id] = device
	}
	return deviceMap, r.Error
}

/**
	获取设备信息(带影厅和影院信息)
 */
func (self *DeviceService) Detail(id int) (map[string]interface{}, error) {
	deviceMap := make(map[string]interface{})
	hallMap := make(map[string]interface{})
	cinemaMap := make(map[string]interface{})
	deviceService := &DeviceService{}
	hallService := &HallService{}
	cinemaService := &CinemaService{}

	device, err := deviceService.Basic(id)
	if err != nil {
		return nil, err
	}
	deviceMap["id"] = device.Id
	deviceMap["name"] = device.Name
	deviceMap["x"] = device.X
	deviceMap["y"] = device.Y
	deviceMap["row_name"] = device.RowName
	deviceMap["column_name"] = device.ColumnName
	deviceMap["stauts"] = device.Status

	hall, err := hallService.Basic(int(device.HallId))
	if err != nil {
		hallMap["name"] = ""
		hallMap["status"] = 0
	}else {
		hallMap["name"] = hall.Name
		hallMap["status"] = hall.Name
	}
	deviceMap["hall"] = hallMap

	cinema, err := cinemaService.Basic(int(device.CinemaId))
	if err != nil {
		cinemaMap["name"] = ""
		cinemaMap["status"] = 0
	}else {
		cinemaMap["name"] = cinema.Name
		cinemaMap["status"] = cinema.Status
	}
	deviceMap["cinema"] = cinemaMap

	return deviceMap, err
}
