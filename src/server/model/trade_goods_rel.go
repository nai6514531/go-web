package model

/**
  订单_商品关联信息
*/
type TradeGoodsRel struct {
	Model
	TradeNo      string `json:"trade_no"`       //订单号
	GoodsId      int    `json:"goods_id"`       //商品id
	GoodsFavorId int    `json:"goods_favor_id"` //订单商品对应的喜好id
	Price        int    `json:"price"`          //价格
	Count        int    `json:"count"`          //数量
	Favor        interface{} `json:"favor,omitempty" gorm:"-"`
	Goods        interface{} `json:"goods,omitempty" gorm:"-"`
}

func (TradeGoodsRel) TableName() string {
	return "trade_goods_rel"
}
