package model

/**
  商品标签
*/
type GoodsLabel struct {
	Model
	Name string `json:"name"` //标签名
}

func (GoodsLabel) TableName() string {
	return "goods_label"
}
