package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type GoodsService struct {
}

func (self *GoodsService) Basic(id int) (*model.Goods, error) {
	goods := &model.Goods{}
	r := common.DB.Where(" id = ? ", id).First(goods)
	if r.Error != nil {
		return nil, r.Error
	}
	return goods, r.Error
}

func (self *GoodsService) BasicMap(ids []int) (map[int]interface{}, error) {
	list := &[]*model.Goods{}
	goodsMap := make(map[int]interface{})

	r := common.DB.Where(" id in (?) ", ids).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, goods := range *list {
		goodsMap[goods.Id] = goods
	}

	return goodsMap, r.Error
}

func (self *GoodsService) Detail(id int) (*model.Goods, error) {
	goods := &model.Goods{}
	goodsService := &GoodsService{}
	goodsCateService := &GoodsCateService{}
	goodsLabelService := &GoodsLabelService{}
	goodsFavorService := &GoodsFavorService{}

	goods, err := goodsService.Basic(id)
	if err != nil {
		return nil, err
	}


	if goods.HasCate {
		//获取分类信息
		cates, err := goodsCateService.BasicByGoodsId(goods.Id)
		if err == nil {
			goods.Cate = cates
		}
	}
	if goods.HasLabel {
		//获取标签信息
		labels, err := goodsLabelService.BasicByGoodsId(goods.Id)
		if err == nil {
			goods.Label = labels
		}
	}
	if goods.HasFavor {
		//获取喜好信息
		favors, err := goodsFavorService.BasicByGoodsId(goods.Id)
		if err == nil {
			goods.Favor = favors
		}
	}
	return goods, err
}

func (self *GoodsService) BasicListByCinemaId(cinemaId int) (*[]*model.Goods, error) {
	list := &[]*model.Goods{}
	r := common.DB.Where(" cinema_id = ? ", cinemaId).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, r.Error
}

func (self *GoodsService) DetailListByCinemaId(cinemaId int) (*[]*model.Goods, error) {
	list := []*model.Goods{}
	goodsService := &GoodsService{}
	_list, err := goodsService.BasicListByCinemaId(cinemaId)
	if err != nil {
		return nil, err
	}
	for _, goods := range *_list {
		_goods, err := goodsService.Detail(int(goods.Id))
		if err != nil {
			continue
		}
		list = append(list, _goods)
	}
	return &list, err
}

func (self *GoodsService) DetailOfTrade(id int, favorId int) (*model.Goods, error) {
	goods := &model.Goods{}
	goodsService := &GoodsService{}
	goodsFavorService := &GoodsFavorService{}

	goods, err := goodsService.Basic(id)
	if err != nil {
		return nil, err
	}
	if goods.HasFavor {
		//获取喜好信息
		goodsFavor, _ := goodsFavorService.Basic(favorId)
		goods.Favor = goodsFavor
	}
	return goods, err
}
