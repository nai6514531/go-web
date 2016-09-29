package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type ReferenceDeviceService struct {
}

func (self *ReferenceDeviceService) Basic(id int) (*model.ReferenceDevice, error) {
	referenceDevice := &model.ReferenceDevice{}
	r := common.DB.Where("id = ?", id).First(referenceDevice)
	if r.Error != nil {
		return nil, r.Error
	}
	return referenceDevice, nil
}

func (self *ReferenceDeviceService) List(page int, perPage int) (*[]*model.ReferenceDevice, error) {
	list := &[]*model.ReferenceDevice{}
	r := common.DB.Offset((page - 1) * perPage).Limit(perPage).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}
