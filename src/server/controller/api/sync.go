package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
)

type SyncController struct {
}

func (self *SyncController) SyncUser(ctx *iris.Context) {
	syncService := &service.SyncService{}
	boo := syncService.SyncUser()
	result := &enity.Result{}
	if !boo {
		result = &enity.Result{"1", nil, "同步后台用户数据失败!"}
	} else {
		result = &enity.Result{"0", nil, "同步后台用户数据成功!"}
	}
	ctx.JSON(iris.StatusOK, result)
}

func (self *SyncController) SyncUserRole(ctx *iris.Context) {
	syncService := &service.SyncService{}
	boo := syncService.SyncUserRole()
	result := &enity.Result{}
	if !boo {
		result = &enity.Result{"1", nil, "同步后台用户角色数据失败!"}
	} else {
		result = &enity.Result{"0", nil, "同步后台用户角色数据成功!"}
	}
	ctx.JSON(iris.StatusOK, result)
}

func (self *SyncController) SyncUserCashAccount(ctx *iris.Context) {
	syncService := &service.SyncService{}
	boo := syncService.SyncUserCashAccount()
	result := &enity.Result{}
	if !boo {
		result = &enity.Result{"1", nil, "同步后台用户分账账户数据失败!"}
	} else {
		result = &enity.Result{"0", nil, "同步后台用户分账账户数据成功!"}
	}
	ctx.JSON(iris.StatusOK, result)
}

func (self *SyncController) SyncDevice(ctx *iris.Context) {
	syncService := &service.SyncService{}
	boo := syncService.SyncDevice()
	result := &enity.Result{}
	if !boo {
		result = &enity.Result{"1", nil, "同步设备数据失败!"}
	} else {
		result = &enity.Result{"0", nil, "同步设备数据成功!"}
	}
	ctx.JSON(iris.StatusOK, result)
}

func (self *SyncController) SyncDailyBill(ctx *iris.Context) {
	syncService := &service.SyncService{}
	boo := syncService.SyncDailyBill()
	result := &enity.Result{}
	if !boo {
		result = &enity.Result{"1", nil, "同步账单数据失败!"}
	} else {
		result = &enity.Result{"0", nil, "同步账单数据成功!"}
	}
	ctx.JSON(iris.StatusOK, result)
}
