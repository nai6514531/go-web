package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/enity"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/common"
)

type SyncController struct {
}

func (self *SyncController) SyncAllUserAndRel(ctx *iris.Context) {
	syncService := &service.SyncService{}
	result := &enity.Result{}
	boo, err := syncService.SyncAllUserAndRel()
	if err != nil || !boo {
		result = &enity.Result{"1", err.Error(), "同步后台用户及相关数据失败!"}
		common.Log(ctx, result)
	}else {
		result = &enity.Result{"0", nil, "同步后台用户及相关数据成功!"}
	}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *SyncController) SyncUser(ctx *iris.Context) {
	syncService := &service.SyncService{}
	result := &enity.Result{}
	list, err := syncService.ListBySyncBoxAdmin()
	if err != nil {
		result = &enity.Result{"2", err.Error(), "拉取旧系统用户信息失败"}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	boo, err := syncService.SyncUser(list)
	if !boo {
		result = &enity.Result{"1", err.Error(), "同步后台用户数据失败!"}
		common.Log(ctx, result)
	} else {
		result = &enity.Result{"0", nil, "同步后台用户数据成功!"}
	}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *SyncController) SyncUserRole(ctx *iris.Context) {
	syncService := &service.SyncService{}
	result := &enity.Result{}
	list, err := syncService.ListBySyncBoxAdmin()
	if err != nil {
		result = &enity.Result{"2", err.Error(), "拉取旧系统用户信息失败"}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	boo, err := syncService.SyncUserRole(list)
	if !boo {
		result = &enity.Result{"1", err.Error(), "同步后台用户角色数据失败!"}
		common.Log(ctx, result)
	} else {
		result = &enity.Result{"0", nil, "同步后台用户角色数据成功!"}
	}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *SyncController) SyncUserCashAccount(ctx *iris.Context) {
	syncService := &service.SyncService{}
	result := &enity.Result{}
	list, err := syncService.ListBySyncBoxAdmin()
	if err != nil {
		result = &enity.Result{"2", err.Error(), "拉取旧系统用户信息失败"}
		common.Log(ctx, result)
		ctx.JSON(iris.StatusOK, result)
		return
	}
	boo, err := syncService.SyncUserCashAccount(list)
	if !boo {
		result = &enity.Result{"1", err.Error(), "同步后台用户分账账户数据失败!"}
		common.Log(ctx, result)
	} else {
		result = &enity.Result{"0", nil, "同步后台用户分账账户数据成功!"}
	}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *SyncController) SyncDevice(ctx *iris.Context) {
	syncService := &service.SyncService{}
	boo, err := syncService.SyncDevice()
	result := &enity.Result{}
	if !boo {
		result = &enity.Result{"1", err.Error(), "同步设备数据失败!"}
		common.Log(ctx, result)
	} else {
		result = &enity.Result{"0", nil, "同步设备数据成功!"}
	}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *SyncController) SyncDailyBill(ctx *iris.Context) {
	syncService := &service.SyncService{}
	boo, err := syncService.SyncDailyBill()
	result := &enity.Result{}
	if !boo {
		result = &enity.Result{"1", err.Error(), "同步账单数据失败!"}
		common.Log(ctx, result)
	} else {
		result = &enity.Result{"0", nil, "同步账单数据成功!"}
	}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}

func (self *SyncController) SyncDailyBillDetail(ctx *iris.Context) {
	syncService := &service.SyncService{}
	boo, err := syncService.SyncDailyBillDetail()
	result := &enity.Result{}
	if !boo {
		result = &enity.Result{"1", err.Error(), "同步账单数据详情失败!"}
		common.Log(ctx, result)
	} else {
		result = &enity.Result{"0", nil, "同步账单数据详情成功!"}
	}
	common.Log(ctx, nil)
	ctx.JSON(iris.StatusOK, result)
}
