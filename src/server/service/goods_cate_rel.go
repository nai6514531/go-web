package service

import (
	"maizuo.com/smart-cinema/src/server/model"
	"maizuo.com/smart-cinema/src/server/common"
)

type GoodsCateRelService struct {
}

func (self *GoodsCateRelService) BasicByGoodsId(goodsId int) (*[]model.GoodsCateRel, error) {
	goodsCateRels := &[]model.GoodsCateRel{}
	r := common.DB.Where("goods_id = ?", goodsId).First(&goodsCateRels)
	if r.Error != nil {
		return nil, r.Error
	}
	return goodsCateRels, r.Error
}

func (self *GoodsCateRelService) BasicByGoodsCateId(cateId int) (*[]model.GoodsCateRel, error) {
	goodsCateRels := &[]model.GoodsCateRel{}
	r := common.DB.Where("goods_cate_id = ?", cateId).First(&goodsCateRels)
	if r.Error != nil {
		return nil, r.Error
	}
	return goodsCateRels, r.Error
}
