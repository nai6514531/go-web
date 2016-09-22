package service

import (
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/common"
)

type GoodsFavorRelService struct {
}

func (self *GoodsFavorRelService) BasicByGoodsId(goodsId int) (*[]model.GoodsFavorRel, error) {
	goodsFavorRels := &[]model.GoodsFavorRel{}
	r := common.DB.Where(" goods_id = ? ", goodsId).Find(&goodsFavorRels)
	if r.Error != nil {
		return nil, r.Error
	}
	return goodsFavorRels, r.Error
}

func (self *GoodsFavorRelService) BasicByGoodsFavorId(favorId int) (*[]model.GoodsFavorRel, error) {
	goodsFavorRels := &[]model.GoodsFavorRel{}
	r := common.DB.Where(" goods_label_id = ? ", favorId).Find(&goodsFavorRels)
	if r.Error != nil {
		return nil, r.Error
	}
	return goodsFavorRels, r.Error
}

func (self *GoodsFavorRelService) BasicByGoodsAndFavorId(goodsId int, favorId int) (*[]model.GoodsFavorRel, error) {
	goodsFavorRels := &[]model.GoodsFavorRel{}
	r := common.DB.Where(" goods_id = ? AND goods_favor_id", goodsId, favorId).First(&goodsFavorRels)
	if r.Error != nil {
		return nil, r.Error
	}
	return goodsFavorRels, r.Error
}

