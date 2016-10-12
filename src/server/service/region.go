package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type RegionService struct {
}

func (self *RegionService) Basic(id int) (*model.Region, error) {
	region := &model.Region{}
	r := common.DB.Where("id = ?", id).First(region)
	if r.Error != nil {
		return nil, r.Error
	}
	return region, r.Error
}

func (self *RegionService) Detail(id int) (*model.Region, error) {
	region := &model.Region{}
	r := common.DB.Where("id = ?", id).First(region)
	if r.Error != nil {
		return nil, r.Error
	}
	return region, r.Error
}

func (self *RegionService) Province() (*[]*model.Region, error) {
	list := &[]*model.Region{}
	r := common.DB.Where("parent_id = ?", 0).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, r.Error
}

func (self *RegionService) City() (*[]*model.Region, error) {
	list := &[]*model.Region{}
	r := common.DB.Where("(level = ? or level = ?) and level_name = ?", 1, 2, "市").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, r.Error
}

func (self *RegionService) CitiesOfProvince(parentId int) (*[]*model.Region, error) {
	list := &[]*model.Region{}
	r := common.DB.Where("parent_id = ?", parentId).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, r.Error
}

func (self *RegionService) DistrictsOfCity(parentId int) (*[]*model.Region, error) {
	list := &[]*model.Region{}
	r := common.DB.Where("parent_id = ?", parentId).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, r.Error
}

func (self *RegionService) SchoolOfProvince(provinceId int) (*[]*model.School, error) {
	list := &[]*model.School{}
	r := common.DB.Where("province_id = ?", provinceId).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, r.Error
}
