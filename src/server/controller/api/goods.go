package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/smart-cinema/src/server/service"
	"strconv"
	"maizuo.com/smart-cinema/src/server/enity"
	"fmt"
)

var (
	goods_msg = map[string]string {
		"01040101": "请求参数异常",

		"01040200": "拉取喜好列表成功",
		"01040201": "拉取喜好列表失败",

		"01040300": "拉取分类列表成功",
		"01040301": "拉取分类列表失败",

		"01040400": "拉取标签列表成功",
		"01040401": "拉取标签列表失败",

		"01040500": "拉取商品详情成功",
		"01040501": "拉取商品详情失败",
	}
)

type GoodsController struct {
}

func (self *GoodsController) Favor(ctx *iris.Context) {
	goodsFavorService := service.GoodsFavorService{}
	result := &enity.Result{}

	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		result = &enity.Result{"01040101", nil, goods_msg["01040101"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	goodsFavorList, err := goodsFavorService.BasicByGoodsId(id)
	if err != nil {
		result = &enity.Result{"01040201", nil, goods_msg["01040201"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	result = &enity.Result{"01040200", &goodsFavorList, goods_msg["01040200"]}
	ctx.JSON(iris.StatusOK, &result)
}

func (self *GoodsController) Cate(ctx *iris.Context) {
	goodsCateService := service.GoodsCateService{}
	result := &enity.Result{}


	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		fmt.Println(err.Error())
		result = &enity.Result{"01040101", nil, goods_msg["01040101"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	goodsCateList, err := goodsCateService.BasicByGoodsId(id)
	if err != nil {
		fmt.Printf(err.Error())
		result = &enity.Result{"01040301", nil, goods_msg["01040301"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	result = &enity.Result{"01040300", &goodsCateList, goods_msg["01040300"]}
	ctx.JSON(iris.StatusOK, &result)
}

func (self *GoodsController) Label(ctx *iris.Context) {
	goodsLabelService := service.GoodsFavorService{}
	result := &enity.Result{}

	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		fmt.Println(err.Error())
		result = &enity.Result{"01040101", nil, goods_msg["01040101"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	goodsLabelList, err := goodsLabelService.BasicByGoodsId(id)
	if err != nil {
		fmt.Printf(err.Error())
		result = &enity.Result{"01040401", nil, goods_msg["01040401"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	result = &enity.Result{"01040400", &goodsLabelList, goods_msg["01040400"]}
	ctx.JSON(iris.StatusOK, &result)
}

func (self *GoodsController) Detail(ctx *iris.Context) {
	goodsService := service.GoodsService{}
	result := &enity.Result{}

	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		result = &enity.Result{"01040101", nil, goods_msg["01040101"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	goodsMap, err := goodsService.Detail(id)
	if err != nil {
		fmt.Printf(err.Error())
		result = &enity.Result{"01040501", nil, goods_msg["01040501"]}
		ctx.JSON(iris.StatusOK, &result)
		return
	}
	result = &enity.Result{"01040500", &goodsMap, goods_msg["01040500"]}
	ctx.JSON(iris.StatusOK, &result)
}
