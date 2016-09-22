package model

/**
  商品信息
*/
type Goods struct {
	Model
	CinemaId      int         `json:"cinema_id"`                //影院id
	Name          string      `json:"name"`                     //商品名
	OriginalPrice int         `json:"original_price"`           //原价
	SellingPrice  int         `json:"selling_price"`            //销售价
	Cover         string      `json:"cover"`                    //商品图片
	Introduction  string      `json:"introduction"`             //商品简介
	Description   string      `json:"description"`              //商品描述
	Status        int         `json:"status"`                   //状态 0:在线 1:下线
	HasCate       bool        `json:"has_cate"`                 //是否有商品分类
	HasLabel      bool        `json:"has_label"`                //是否有商品标签
	HasFavor      bool        `json:"has_favor"`                //是否有商品喜好
	Cate          interface{} `json:"cate,omitempty" gorm:"-"`  //商品分类
	Label         interface{} `json:"label,omitempty" gorm:"-"` //商品标签
	Favor         interface{} `json:"favor,omitempty" gorm:"-"` //商品喜好
}

func (Goods) TableName() string {
	return "goods"
}
