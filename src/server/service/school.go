package service

import (
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/common"
)

type SchoolService struct {

}

func (self *SchoolService) Basic(id int) (*model.School, error) {
	school := &model.School{}
	r := common.DB.Where("id = ?", id).First(school)
	if r.Error != nil {
		return nil, r.Error
	}
	return school, nil
}
