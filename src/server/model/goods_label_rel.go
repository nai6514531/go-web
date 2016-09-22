package model

/**
  商品_商品标签关联信息
*/
type GoodsLabelRel struct {
	Model
	GoodsId      int `json:"goods_id"`       //商品id
	GoodsLabelId int `json:"goods_label_id"` //商品标签id
}

func (GoodsLabelRel) TableName() string {
	return "goods_label_rel"
}
