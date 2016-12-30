package service

import (
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
)

type DeviceOperateService struct {
}

func (self *DeviceOperateService) Create(deviceOperate *model.DeviceOperate) (int, error) {
	var err error
	isTrue := common.DB.NewRecord(deviceOperate)
	if !isTrue {
		e := &functions.DefinedError{}
		e.Msg = "can not create a new record!"
		err = e
		return 0, err
	}
	r := common.DB.Create(&deviceOperate)
	if r.Error != nil {
		return 0, r.Error
	}
	return int(r.RowsAffected), nil
}
