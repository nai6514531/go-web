package service

import (
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/common"
)

type CashAccountTypeService struct {

}

func (self *CashAccountTypeService) List() (*[]*model.CashAccountType, error) {
	list := &[]*model.CashAccountType{}
	r := common.SodaMngDB_R.Model(&model.CashAccountType{}).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}
