package model

/**
  商品_商品喜好关联信息
*/
type GoodsFavorRel struct {
	Model
	GoodsId      int `json:"goods_id"`       //商品id
	GoodsFavorId int `json:"goods_favor_id"` //商品喜好id
}

func (GoodsFavorRel) TableName() string {
	return "goods_favor_rel"
}
