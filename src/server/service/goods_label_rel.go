package service

import (
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/common"
)

type GoodsLabelRelService struct {
}

func (self *GoodsLabelRelService) BasicByGoodsId(goodsId int) (*[]model.GoodsLabelRel, error) {
	goodsLabelRels := &[]model.GoodsLabelRel{}
	r := common.DB.Where(" goods_id = ? ", goodsId).Find(&goodsLabelRels)
	if r.Error != nil {
		return nil, r.Error
	}
	return goodsLabelRels, r.Error
}

func (self *GoodsLabelRelService) BasicByGoodsLabelId(goodsLabelId int) (*[]model.GoodsLabelRel, error) {
	goodsLabelRels := &[]model.GoodsLabelRel{}
	r := common.DB.Where(" goods_label_id = ? ", goodsLabelId).Find(&goodsLabelRels)
	if r.Error != nil {
		return nil, r.Error
	}
	return goodsLabelRels, r.Error
}

