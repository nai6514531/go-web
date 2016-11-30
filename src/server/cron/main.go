package cron

import (
	"github.com/robfig/cron"
	"maizuo.com/soda-manager/src/server/controller/api"
	"maizuo.com/soda-manager/src/server/service"
	"github.com/spf13/viper"
)

var (
	dailyBill = &controller.DailyBillController{}
	syncService = &service.SyncService{}
)

func SetUpCron() {

	isDevelopment := viper.GetBool("isDevelopment")
	if isDevelopment == false {
		c := cron.New()

		syncDailyBillDetailSpec := viper.GetString("cron.syncDailyBillDetailSpec")
		syncDailyBillSpec := viper.GetString("cron.syncDailyBillSpec")
		syncDeviceSpec := viper.GetString("cron.syncDeviceSpec")
		syncUserSpec := viper.GetString("cron.syncUserSpec")
		updateSpec := viper.GetString("cron.updateSpec")
		applySpec := viper.GetString("cron.applySpec")
		c.AddFunc(applySpec, dailyBill.TimedApplyBill)
		c.AddFunc(updateSpec, dailyBill.TimedUpdateAliPayStatus)

		c.AddFunc(syncDailyBillDetailSpec, func() {
			syncService.SyncDailyBillDetail()
		})
		c.AddFunc(syncDailyBillSpec, func() {
			syncService.SyncDailyBill()
		})
		c.AddFunc(syncDeviceSpec, func() {
			syncService.SyncDevice()
		})
		c.AddFunc(syncUserSpec, func() {
			syncService.SyncUserAndRel()
		})

		c.Start()
	}

}
