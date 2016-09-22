package service

import (
	"maizuo.com/smart-cinema/src/server/common"
	"maizuo.com/smart-cinema/src/server/model"
)

type RegionService struct {
}

func (self *RegionService) Basic(id int) (*model.Region, error) {
	region := &model.Region{}
	r := common.DB.Where("id = ?", id).Find(region)
	if r.Error != nil {
		return nil, r.Error
	}
	return region, r.Error
}

func (self *RegionService) Detail(id int) (*model.Region, error) {
	region := &model.Region{}
	r := common.DB.Where("id = ?", id).Find(region)
	if r.Error != nil {
		return nil, r.Error
	}
	return region, r.Error
}

func (self *RegionService) Province() ([]*model.Region, error) {
	regions := []*model.Region{}
	r := common.DB.Where("parent_id = ?", 0).Find(&regions)
	if r.Error != nil {
		return nil, r.Error
	}
	return regions, r.Error
}

func (self *RegionService) City() ([]*model.Region, error) {
	regions := []*model.Region{}
	r := common.DB.Where("(level = ? or level = ?) and level_name = ?", 1, 2, "市").Find(&regions)
	if r.Error != nil {
		return nil, r.Error
	}
	return regions, r.Error
}

func (self *RegionService) CitiesOfProvince(parent_id int) ([]*model.Region, error) {
	regions := []*model.Region{}
	r := common.DB.Where("parent_id = ?", parent_id).Find(&regions)
	if r.Error != nil {
		return nil, r.Error
	}
	return regions, r.Error
}

func (self *RegionService) DistrictsOfCity(parent_id int) ([]*model.Region, error) {
	regions := []*model.Region{}
	r := common.DB.Where("parent_id = ?", parent_id).Find(&regions)
	if r.Error != nil {
		return nil, r.Error
	}
	return regions, r.Error
}




