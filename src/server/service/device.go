package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type DeviceService struct {
}

func (self *DeviceService) Basic(id int) (*model.Device, error) {
	device := &model.Device{}
	r := common.DB.Where("id = ?", id).First(device)
	if r.Error != nil {
		return nil, r.Error
	}
	return device, nil
}

func (self *DeviceService) List( page int, perPage int) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	r := common.DB.Offset((page - 1) * perPage).Limit(perPage).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DeviceService) ListByUser(userId int, page int, perPage int) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	//limit perPage offset (page-1)*perPage
	r := common.DB.Offset((page - 1) * perPage).Limit(perPage).Where("user_id = ?", userId).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DeviceService) ListByUserAndSchool(userId int, schoolId int, page int, perPage int) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	r := common.DB.Offset((page - 1) * perPage).Limit(perPage).Where("user_id = ? and school_id = ?", userId, schoolId).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}
