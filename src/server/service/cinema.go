package service

import (
	"maizuo.com/smart-cinema/src/server/common"
	"maizuo.com/smart-cinema/src/server/model"
)

type CinemaService struct {
}

func (self *CinemaService) Basic(id int) (*model.Cinema, error) {
	cinema := &model.Cinema{}
	r := common.DB.Where("id = ?", id).First(&cinema)
	if r.Error != nil {
		return nil, r.Error
	}
	return cinema, r.Error
}

func (self *CinemaService) BasicMap(ids []int) (map[int]interface{}, error) {
	list := &[]*model.Cinema{}
	cinemaMap := make(map[int]interface{})

	r := common.DB.Where("id in (?)", ids).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, cinema := range *list {
		cinemaMap[cinema.Id] = cinema
	}
	return cinemaMap, r.Error
}

func (self *CinemaService) Detail(id int) (*model.Cinema, error) {
	cinema := &model.Cinema{}
	r := common.DB.Where("id = ?", id).First(cinema)
	if r.Error != nil {
		return nil, r.Error
	}
	regionService := &RegionService{}
	cinemaCircuitService := &CinemaCircuitService{}
	province, _ := regionService.Basic(cinema.ProvinceId)
	city, _ := regionService.Basic(cinema.CityId)
	district, _ := regionService.Basic(cinema.DistrictId)
	cinemaCircuit, _ := cinemaCircuitService.Basic(cinema.CinemaCircuitId)
	cinema.Province = province
	cinema.City = city
	cinema.District = district
	cinema.CinemaCircuit = cinemaCircuit
	return cinema, r.Error
}

func (self *CinemaService) ListByCityId(cityId int) ([]*model.Cinema, error) {
	list := []*model.Cinema{}
	r := common.DB.Where("cityId = ?", cityId).First(&list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}
