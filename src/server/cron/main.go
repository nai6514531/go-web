package cron

import (
	"github.com/robfig/cron"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/controller/api"
	"maizuo.com/soda-manager/src/server/service"
)

var (
	dailyBill     = &controller.DailyBillController{}
	syncService   = &service.SyncService{}
	deviceService = &service.DeviceService{}
)

func SetUpCron() {

	isDevelopment := viper.GetBool("isDevelopment")
	if isDevelopment == false {
		c := cron.New()

		// syncDailyBillDetailSpec := viper.GetString("cron.syncDailyBillDetailSpec")
		// syncDailyBillSpec := viper.GetString("cron.syncDailyBillSpec")
		// syncDeviceSpec := viper.GetString("cron.syncDeviceSpec")
		// syncUserSpec := viper.GetString("cron.syncUserSpec")
		updateSpec := viper.GetString("cron.updateSpec")
		updateFirstDeviceSpec := viper.GetString("cron.updateFirstDeviceSpec")
		updateSecondDeviceSpec := viper.GetString("cron.updateSecondDeviceSpec")
		updateThirdDeviceSpec := viper.GetString("cron.updateThirdDeviceSpec")
		updateFourthDeviceSpec := viper.GetString("cron.updateFourthDeviceSpec")
		//applySpec := viper.GetString("cron.applySpec")
		//c.AddFunc(applySpec, dailyBill.TimedApplyAliPayBill)
		c.AddFunc(updateSpec, dailyBill.TimedUpdateAliPayStatus)
		c.AddFunc(updateFirstDeviceSpec, func() {
			deviceService.TimedUpdateStatus(601)
		})
		c.AddFunc(updateSecondDeviceSpec, func() {
			deviceService.TimedUpdateStatus(602)
		})
		c.AddFunc(updateThirdDeviceSpec, func() {
			deviceService.TimedUpdateStatus(603)
		})
		c.AddFunc(updateFourthDeviceSpec, func() {
			deviceService.TimedUpdateStatus(604)
		})
		c.AddFunc(updateFourthDeviceSpec, func() {
			deviceService.TimedUpdateStatus(606)
		})
		c.AddFunc(updateFourthDeviceSpec, func() {
			deviceService.TimedUpdateStatus(607)
		})
		c.AddFunc(updateFourthDeviceSpec, func() {
			deviceService.TimedUpdateStatus(608)
		})
		/*c.AddFunc(syncDailyBillDetailSpec, func() {
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
		})*/

		c.Start()
	}

}
