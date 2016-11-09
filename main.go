package main

import (
	"maizuo.com/soda-manager/src/server"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/cron"
)

func main() {

	common.SetUpConfig()

	common.SetUpCommon()

	common.SetUpLogger()

	common.SetUpSession()

	common.SetUpDB()

	common.SetUpMNDB()

	common.SetUpRedis()

	//common.SetUpRateLimiter()

	//common.SetUpCors()

	//common.SetUpSecure()

	cron.SetUpCron()

	server.SetUpServer()
}
