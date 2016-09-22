package service

import (
	"maizuo.com/smart-cinema/src/server/common"
	"maizuo.com/smart-cinema/src/server/model"
)

type HallService struct {
}

func (self *HallService) Basic(id int) (*model.Hall, error) {
	hall := &model.Hall{}
	r := common.DB.Where("id = ?", id).First(hall)
	if r.Error != nil {
		return nil, r.Error
	}
	return hall, r.Error
}

func (self *HallService) BasicMap(ids []int) (map[int]interface{}, error) {
	list := &[]*model.Hall{}
	hallMap := make(map[int]interface{})

	r := common.DB.Where("id in (?)", ids).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, hall := range *list {
		hallMap[hall.Id] = hall
	}
	return hallMap, r.Error
}

func (self *HallService) BasicListByCinemaId(cinemaId int) (*[]*model.Hall, error) {
	list := &[]*model.Hall{}
	r := common.DB.Where(" cinema_id = ? ", cinemaId).Find(list)
	if r.Error != nil {
		return  nil, r.Error
	}
	return list, r.Error
}

func (self *HallService) DetailListByCinemaId(cinemaId int, at string) (*[]*model.Hall, error) {
	list := &[]*model.Hall{}
	hallService := &HallService{}
	tradeService := &TradeService{}

	list, err := hallService.BasicListByCinemaId(cinemaId)
	if err != nil {
		return  nil, err
	}

	newCountMap , _ := tradeService.CountMapByCinemaId(cinemaId, at, 0)
	noPrintCountMap, _ := tradeService.CountMapByCinemaId(cinemaId, at, 1)
	printedCountMap, _ := tradeService.CountMapByCinemaId(cinemaId, at, 2)
	for _, hall := range *list {
		hall.NewCount = newCountMap[hall.Id]
		hall.NoPrintCount = noPrintCountMap[hall.Id]
		hall.PrintedCount = printedCountMap[hall.Id]
	}
	return list, nil
}
