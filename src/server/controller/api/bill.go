package controller

import (
	"github.com/bitly/go-simplejson"
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/common"
	//"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/service"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/enity"
)

type BillController struct {
}

// 根据id是否为空来新增或者修改bill
func (self *BillController) InsertOrUpdate(ctx *iris.Context) {
	billService := &service.BillService{}
	userCashAccountService := &service.UserCashAccountService{}
	reqeust := simplejson.New()
	ctx.ReadJSON(reqeust)
	id, _ := reqeust.Get("id").Int()
	userId,_ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	userId = 1
	userCashAccount,err := userCashAccountService.BasicByUserId(userId)
	if err != nil {
		// 用户账号信息有误
		common.Logger.Debugln("InsertOrUpdate userCashAccount err:",err)
		ctx.JSON(iris.StatusOK,&enity.Result{"code",nil,"用户账号信息有误"})
		return
	}
	if id == 0 {
		billService.Insert(userId,userCashAccount)
	}else{
		common.Logger.Debugln("重新发起提现")
	}

}
