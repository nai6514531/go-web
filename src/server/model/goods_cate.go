package model

/**
  商品分类
*/
type GoodsCate struct {
	Model
	Name     string `json:"name"`      //分类名
	parentId int    `json:"parent_id"` //分类id的父id
}

func (GoodsCate) TableName() string {
	return "goods_cate"
}
