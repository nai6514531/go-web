package service

import (
	"maizuo.com/smart-cinema/src/server/model"
	"maizuo.com/smart-cinema/src/server/common"
	"maizuo.com/smart-cinema/src/server/util"
)

type TradeGoodsRelService struct{
}

func (self *TradeGoodsRelService) Create(tradeGoodsRel *model.TradeGoodsRel) error {
	var err error
	isTrue := common.DB.NewRecord(tradeGoodsRel)
	if !isTrue {
		e := &util.DefinedError{}
		e.Msg = "can not create a new record!"
		err = e
		return err
	}
	r := common.DB.Create(&tradeGoodsRel)
	if r.Error != nil {
		return r.Error
	}
	return nil
}

func (self *TradeGoodsRelService) BasicMap(tradeNos []string) (map[string]interface{}, error) {
	tgrMap := make(map[string]interface{})
	list := &[]*model.TradeGoodsRel{}
	var _list []*model.TradeGoodsRel
	goodsService := &GoodsService{}
	goodsFavorService := &GoodsFavorService{}
	goodsMap :=  make(map[int]interface{})
	favorMap := make(map[int]interface{})
	goodsIds :=  []int{}
	favorIds := []int{}

	r := common.DB.Where(" trade_no IN (?)", tradeNos).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, tgr := range *list {
		goodsIds = append(goodsIds, tgr.GoodsId)
		favorIds = append(favorIds, tgr.GoodsFavorId)
	}

	if len(goodsIds) != 0 {
		goodsMap, _ = goodsService.BasicMap(goodsIds)
	}
	if len(favorIds) != 0 {
		favorMap, _ = goodsFavorService.BasicMap(favorIds)
	}
	for _, tgr := range *list {
		_goodsMap :=  make(map[string]interface{})
		_favorMap := make(map[string]interface{})

		if goodsMap[tgr.GoodsId] != nil {
			_goods := goodsMap[tgr.GoodsId].(*model.Goods)
			_goodsMap["name"] = _goods.Name
			tgr.Goods = _goodsMap
		}
		if favorMap[tgr.GoodsFavorId] != nil {
			_favor := favorMap[tgr.GoodsFavorId].(*model.GoodsFavor)
			_favorMap["name"] = _favor.Name
			tgr.Favor = _favorMap
		}

		if tgrMap[tgr.TradeNo] == nil{
			_list = []*model.TradeGoodsRel{}
		}else {
			_list = tgrMap[tgr.TradeNo].([]*model.TradeGoodsRel)
		}
		_list = append(_list, tgr)
		tgrMap[tgr.TradeNo] = _list
	}
	return tgrMap, r.Error
}
