package service

import (
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/common"
)

type CinemaCircuitService struct {

}

func (self *CinemaCircuitService)Basic(id int) (*model.CinemaCirCuit, error) {
	cinameCirCuit := &model.CinemaCirCuit{}
	r := common.DB.Where("id = ?", id).First(&cinameCirCuit)
	if r.Error != nil {
		return nil, r.Error
	}
	return cinameCirCuit, r.Error
}
