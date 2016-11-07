package timed

import (
	"github.com/robfig/cron"
	"maizuo.com/soda-manager/src/server/controller/api"
)

var (
	dailyBill = &controller.DailyBillController{}
)

func SetUpCron() {
	c := cron.New()
	applySpec := "0 0 7 * * ?"
	updateSpec := "0 0 6 * * ?"
	if applySpec != "" {
		c.AddFunc(applySpec, dailyBill.TimedApplyAliPayBill)
	}

	if updateSpec != "" {
		c.AddFunc(updateSpec, dailyBill.TimedUpdateAlipayStatus)
	}

	c.Start()
}
