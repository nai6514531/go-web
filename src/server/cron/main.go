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

	if isDevelopment {

		c := cron.New()

		syncDailyBillDetailSpec := viper.GetString("cron.syncDailyBillDetailSpec")
		syncDailyBillSpec := viper.GetString("cron.syncDailyBillSpec")
		syncDeviceSpec := viper.GetString("cron.syncDeviceSpec")
		syncUserSpec := viper.GetString("cron.syncUserSpec")
		syncUserCashSpec := viper.GetString("cron.syncUserCashSpec")
		syncUserRoleSpec := viper.GetString("cron.syncUserRoleSpec")
		updateSpec := viper.GetString("cron.updateSpec")
		applySpec := viper.GetString("cron.applySpec")

		c.AddFunc(applySpec, dailyBill.TimedApplyAliPayBill)
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
			syncService.SyncUser()
		})
		c.AddFunc(syncUserCashSpec, func() {
			syncService.SyncUserCashAccount()
		})
		c.AddFunc(syncUserRoleSpec, func() {
			syncService.SyncUserRole()
		})

		c.Start()
	}

}
