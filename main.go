package main

import (
	"maizuo.com/soda-manager/src/server"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/timed"
)

func main() {

	common.SetUpConfig()

	common.SetUpLogger()

	common.SetUpSession()

	common.SetUpDB()

	common.SetUpMNDB()

	common.SetUpMNDBPROD()

	common.SetUpRedis()

	common.SetUpCommon()

	common.SetUpRateLimiter()

	common.SetUpCors()

	//common.SetUpSecure()

	timed.SetUpCron()

	server.SetUpServer()
}
