package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
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

func (self *SchoolService) List(ids ...int) (*[]*model.School, error) {
	list := &[]*model.School{}
	r := common.DB.Where("id in (?) ", ids).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *SchoolService) ListByIdList(idList []int) (*[]*model.School, error) {
	schools := &[]*model.School{}
	r := common.DB.Where("id IN (?)", idList).Find(schools)
	if r.Error != nil {
		return nil, r.Error
	}
	return schools, nil
}
