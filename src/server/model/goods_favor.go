package model

/**
  商品喜好信息
*/
type GoodsFavor struct {
	Model
	Name        string `json:"name"`          //喜好名
	goodsCateId int    `json:"goods_cate_id"` //商品分类id
}

func (GoodsFavor) TableName() string {
	return "goods_favor"
}
