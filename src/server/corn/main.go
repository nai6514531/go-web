package timed

import (
	"github.com/robfig/cron"
	"maizuo.com/soda-manager/src/server/controller/api"
	"maizuo.com/soda-manager/src/server/service"
)

var (
	dailyBill = &controller.DailyBillController{}
	syncService = &service.SyncService{}
)

func SetUpCron() {

	c := cron.New()

	syncDailyBillDetailSpec := "0 15 5 * * ?"
	syncDailyBillSpec := "0 45 5 * * ?"
	syncDeviceSpec := "0 0 6 * * ?"
	syncUserSpec := "0 30 6 * * ?"
	updateSpec := "0 45 6 * * ?"
	applySpec := "0 0 7 * * ?"

	c.AddFunc(applySpec, dailyBill.TimedApplyAliPayBill)
	c.AddFunc(updateSpec, dailyBill.TimedUpdateAlipayStatus)
	
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

	c.Start()
}
