package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type ProvinceService struct {
}

func (self *ProvinceService) GetByID(id int) (*model.Province, error) {
	province := model.Province{}
	err := common.SodaMngDB_R.Where("id = ?", id).First(&province).Error
	if err != nil {
		return nil, err
	}
	return &province, nil
}
