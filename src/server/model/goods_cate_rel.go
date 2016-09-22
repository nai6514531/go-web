package model

/**
  商品_商品分类关联
*/
type GoodsCateRel struct {
	Model
	GoodsId     int `json:"goods_id"`      //商品id
	GoodsCateId int `json:"goods_cate_id"` //商品分类id
}

func (GoodsCateRel) TableName() string {
	return "goods_cate_rel"
}
