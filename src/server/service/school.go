package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"github.com/jinzhu/gorm"
	"maizuo.com/soda-manager/src/server/kit/functions"
)

type SchoolService struct {
}

func (self *SchoolService) Basic(id int) (*model.School, error) {
	school := &model.School{}
	r := common.SodaMngDB_R.Where("id = ?", id).First(school)
	if r.Error != nil {
		return nil, r.Error
	}
	return school, nil
}

func (self *SchoolService) List(ids ...int) (*[]*model.School, error) {
	list := &[]*model.School{}
	var r *gorm.DB
	if len(ids) <= 0 {
		r = common.SodaMngDB_R.Find(list)
	}else {
		r = common.SodaMngDB_R.Where("id in (?) ", ids).Find(list)
	}
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *SchoolService) ListByIdList(idList []int) (*[]*model.School, error) {
	schools := &[]*model.School{}
	r := common.SodaMngDB_R.Where("id IN (?)", idList).Find(schools)
	if r.Error != nil {
		return nil, r.Error
	}
	return schools, nil
}

func (self *SchoolService) BasicMap(ids ...int) (map[int]*model.School, error) {
	schoolService := &SchoolService{}
	data := make(map[int]*model.School, 0)
	if len(ids) <= 0 {
		e := &functions.DefinedError{}
		e.Msg = "无学校id"
		err := e
		return nil, err
	}
	list, err := schoolService.List(ids...)
	if err != nil {
		return nil, err
	}
	for _, _school := range *list {
		data[_school.Id] = _school
	}
	return data, nil
}

func (self *SchoolService) BasicMapByLikeName(name string)  (map[int]*model.School, error) {
	list := &[]*model.School{}
	data := make(map[int]*model.School, 0)
	r := common.SodaMngDB_R.Where("name like ?", "%"+name+"%").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	for _, _school := range *list {
		data[_school.Id] = _school
	}
	return data, nil
}

func (self *SchoolService) BasicMapAll() (map[int]*model.School, error) {
	list := &[]*model.School{}
	data := make(map[int]*model.School, 0)
	r := common.SodaMngDB_R.Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	for _, _school := range *list {
		data[_school.Id] = _school
	}
	return data, nil
}
