package service

import (
	"maizuo.com/smart-cinema/src/server/model"
	"maizuo.com/smart-cinema/src/server/common"
)

type GoodsCateService struct {
}

func (self *GoodsCateService) Basic(id int) (*model.GoodsCate, error) {
	goodsCate := &model.GoodsCate{}
	r := common.DB.Where(" id = ? ", id).First(&goodsCate)
	if r.Error != nil {
		return nil, r.Error
	}
	return goodsCate, r.Error
}

func (self *GoodsCateService) BasicMap(ids []int) (map[int]interface{}, error) {
	list := &[]*model.GoodsCate{}
	cateMap := make(map[int]interface{})

	r := common.DB.Where(" id in (?) ", ids).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, goodsCate := range *list {
		cateMap[goodsCate.Id] = goodsCate
	}

	return cateMap, r.Error
}

func (self *GoodsCateService) BasicByGoodsId(goodsId int) ([]*model.GoodsCate, error) {
	gooodsCateRelService := &GoodsCateRelService{}
	goodsCateService := GoodsCateService{}
	goodsCateList := []*model.GoodsCate{}
	goodsCateIds := []int{}
	goodsCateMap := make(map[int]interface{})

	list, err := gooodsCateRelService.BasicByGoodsId(goodsId)
	if err != nil {
		return nil, err
	}

	for _, goodsCateRel := range *list {
		goodsCateIds = append(goodsCateIds, goodsCateRel.GoodsCateId)
	}
	if len(goodsCateIds) != 0 {
		goodsCateMap, _ = goodsCateService.BasicMap(goodsCateIds)
	}

	for _, goodsCateRel := range *list {
		if goodsCateMap[goodsCateRel.GoodsCateId] != nil {
			goodsCate := goodsCateMap[goodsCateRel.GoodsCateId].(*model.GoodsCate)
			goodsCateList = append(goodsCateList, goodsCate)
		}
	}

	return goodsCateList, err

}
