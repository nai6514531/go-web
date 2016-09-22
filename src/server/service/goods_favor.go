package service

import (
	"maizuo.com/smart-cinema/src/server/model"
	"maizuo.com/smart-cinema/src/server/common"
)

type GoodsFavorService struct {
}

func (self *GoodsFavorService) Basic(id int) (*model.GoodsFavor, error) {
	goodsFavor := &model.GoodsFavor{}
	r := common.DB.Where(" id = ? ", id).First(&goodsFavor)
	if r.Error != nil {
		return nil, r.Error
	}
	return goodsFavor, r.Error
}

func (self *GoodsFavorService) BasicMap(ids []int) (map[int]interface{}, error) {
	list := &[]*model.GoodsFavor{}
	favorMap := make(map[int]interface{})

	r := common.DB.Where(" id in (?) ", ids).Find(&list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, favor := range *list {
		favorMap[favor.Id] = favor
	}
	return favorMap, r.Error
}

func (self *GoodsFavorService) BasicByGoodsId(goodsId int) ([]*model.GoodsFavor, error) {
	goodsFavorRelService := &GoodsFavorRelService{}
	goodsFavorService := GoodsFavorService{}
	goodsFavorList := []*model.GoodsFavor{}
	goodsFavorIds := []int{}
	goodsFavorMap := make(map[int]interface{})

	list, err := goodsFavorRelService.BasicByGoodsId(goodsId)
	if err != nil {
		return nil, err
	}

	for _, goodsFavorRel := range *list {
		goodsFavorIds = append(goodsFavorIds, goodsFavorRel.GoodsFavorId)
	}
	if len(goodsFavorIds) != 0 {
		goodsFavorMap, _ = goodsFavorService.BasicMap(goodsFavorIds)
	}

	for _, goodsFavorRel := range *list {
		if goodsFavorMap[goodsFavorRel.GoodsFavorId] != nil {
			goodsFavor := goodsFavorMap[goodsFavorRel.GoodsFavorId].(*model.GoodsFavor)
			goodsFavorList = append(goodsFavorList, goodsFavor)
		}
	}

	return goodsFavorList, err

}
