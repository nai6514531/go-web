package service

import (
	"maizuo.com/smart-cinema/src/server/model"
	"maizuo.com/smart-cinema/src/server/common"
)

type GoodsLabelService struct {
}

func (self *GoodsLabelService) Basic(id int) (*model.GoodsLabel, error) {
	goodsLabel := &model.GoodsLabel{}
	r := common.DB.Where(" id = ? ", id).First(&goodsLabel)
	if r.Error != nil {
		return nil, r.Error
	}
	return goodsLabel, r.Error
}

func (self *GoodsLabelService) BasicMap(ids []int) (map[int]interface{}, error) {
	list := &[]*model.GoodsLabel{}
	labelMap := make(map[int]interface{})

	r := common.DB.Where(" id in (?) ", ids).Find(&list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, label := range *list {
		labelMap[label.Id] = label
	}
	return labelMap, r.Error
}

func (self *GoodsLabelService) BasicByGoodsId(goodsId int) ([]*model.GoodsLabel, error) {
	gooodsLabelRelService := &GoodsLabelRelService{}
	goodsLabelService := GoodsLabelService{}
	goodsLabelList := []*model.GoodsLabel{}
	goodsLabelIds := []int{}
	goodsLabelMap := make(map[int]interface{})

	list, err := gooodsLabelRelService.BasicByGoodsId(goodsId)
	if err != nil {
		return nil, err
	}

	for _, goodsLabelRel := range *list {
		goodsLabelIds = append(goodsLabelIds, goodsLabelRel.GoodsLabelId)
	}
	if len(goodsLabelIds) != 0 {
		goodsLabelMap, _ = goodsLabelService.BasicMap(goodsLabelIds)
	}

	for _, goodsLabelRel := range *list {
		goodsLabel, err := goodsLabelService.Basic(int(goodsLabelRel.GoodsLabelId))
		if err == nil {
			goodsLabelList = append(goodsLabelList, goodsLabel)
		}
	}

	for _, goodsLabelRel := range *list {
		if goodsLabelMap[goodsLabelRel.GoodsLabelId] != nil {
			goodsLabel := goodsLabelMap[goodsLabelRel.GoodsLabelId].(*model.GoodsLabel)
			goodsLabelList = append(goodsLabelList, goodsLabel)
		}
	}

	return goodsLabelList, err

}

