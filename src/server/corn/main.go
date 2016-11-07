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

	syncDailyBillDetailSpec := "0 0 4 * * ?"
	syncDailyBillSpec := "0 30 4 * * ?"
	syncDeviceSpec := "0 40 4 * * ?"
	syncUserSpec := "0 10 5 * * ?"
	syncUserCashSpec := "0 20 5 * * ?"
	syncUserRoleSpec := "0 30 5 * * ?"
	updateSpec := "0 40 6 * * ?"
	applySpec := "0 50 6 * * ?"

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
	c.AddFunc(syncUserCashSpec, func() {
		syncService.SyncUserCashAccount()
	})
	c.AddFunc(syncUserRoleSpec, func() {
		syncService.SyncUserRole()
	})

	c.Start()
}
